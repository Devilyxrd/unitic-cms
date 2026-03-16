// @ts-nocheck
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EntryStatus, FieldType, Prisma, Role } from '@prisma/client';
import { EntriesService } from './entries.service';

describe('EntriesService', () => {
  const prismaMock = {
    contentType: {
      findUnique: jest.fn(),
    },
    entry: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const entriesService = new EntriesService(prismaMock);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws not found when content type does not exist', async () => {
    prismaMock.contentType.findUnique.mockResolvedValue(null);

    await expect(
      entriesService.create(
        'unknown',
        {
          status: EntryStatus.DRAFT,
          values: [],
        },
        {
          id: 'user-1',
          email: 'editor@unitic.dev',
          role: Role.EDITOR,
        },
      ),
    ).rejects.toThrow(new NotFoundException('İçerik tipi bulunamadı.'));
  });

  it('throws bad request when required field is missing', async () => {
    prismaMock.contentType.findUnique.mockResolvedValue({
      id: 'content-type-1',
      fields: [
        {
          id: 'field-1',
          type: FieldType.TEXT,
          required: true,
          name: 'Baslik',
          order: 1,
        },
      ],
    });

    await expect(
      entriesService.create(
        'blog',
        {
          status: EntryStatus.DRAFT,
          values: [],
        },
        {
          id: 'user-1',
          email: 'editor@unitic.dev',
          role: Role.EDITOR,
        },
      ),
    ).rejects.toThrow(new BadRequestException('Baslik alanı zorunludur.'));
  });

  it('throws not found when updating unknown entry status', async () => {
    prismaMock.entry.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('not found', {
        code: 'P2025',
        clientVersion: '7.5.0',
      }),
    );

    await expect(entriesService.updateStatus('unknown', EntryStatus.PUBLISHED)).rejects.toThrow(
      new NotFoundException('Kayıt bulunamadı.'),
    );
  });
});
