// @ts-nocheck
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { hash } from 'bcryptjs';
import { UsersService } from './users.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  const prismaMock = {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const usersService = new UsersService(prismaMock);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists users with total count', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: '1' },
      { id: '2' },
    ]);

    const result = await usersService.list();

    expect(result).toEqual({
      data: [{ id: '1' }, { id: '2' }],
      total: 2,
    });
  });

  it('throws conflict exception for duplicate email/username', async () => {
    hash.mockResolvedValue('hashed-password');
    prismaMock.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('conflict', {
        code: 'P2002',
        clientVersion: '7.5.0',
      }),
    );

    await expect(
      usersService.create({
        email: 'editor@unitic.dev',
        username: 'editor',
        password: 'Editor123!',
        role: Role.EDITOR,
      }),
    ).rejects.toThrow(new ConflictException('E-posta veya kullanıcı adı zaten kullanımda.'));
  });

  it('throws not found when updating unknown user active status', async () => {
    prismaMock.user.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('not found', {
        code: 'P2025',
        clientVersion: '7.5.0',
      }),
    );

    await expect(usersService.setActive('unknown', true)).rejects.toThrow(
      new NotFoundException('Kullanıcı bulunamadı.'),
    );
  });
});
