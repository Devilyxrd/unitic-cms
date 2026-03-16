import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { hash } from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return { data: users, total: users.length };
  }

  async create(payload: CreateUserDto) {
    const passwordHash = await hash(payload.password, 10);

    try {
      return await this.prisma.user.create({
        data: {
          email: payload.email,
          username: payload.username,
          password: passwordHash,
          role: payload.role ?? Role.EDITOR,
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'E-posta veya kullanıcı adı zaten kullanımda.',
        );
      }
      throw error;
    }
  }

  async setActive(id: string, active: boolean) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { isActive: active },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Kullanıcı bulunamadı.');
      }
      throw error;
    }
  }
}
