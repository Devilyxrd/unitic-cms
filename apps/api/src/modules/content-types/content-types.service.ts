import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AddContentFieldDto } from './dto/add-content-field.dto';
import { CreateContentTypeDto } from './dto/create-content-type.dto';
import { UpdateContentTypeDto } from './dto/update-content-type.dto';
import { UpdateContentFieldDto } from './dto/update-content-field.dto';

@Injectable()
export class ContentTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const items = await this.prisma.contentType.findMany({
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data: items, total: items.length };
  }

  async getById(id: string) {
    const item = await this.prisma.contentType.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('İçerik tipi bulunamadı.');
    }

    return item;
  }

  async create(payload: CreateContentTypeDto) {
    try {
      return await this.prisma.contentType.create({
        data: {
          name: payload.name,
          slug: payload.slug,
          description: payload.description,
        },
        include: {
          fields: {
            orderBy: { order: 'asc' },
          },
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Bu slug ile bir içerik tipi zaten mevcut.',
        );
      }
      throw error;
    }
  }

  async addField(contentTypeId: string, payload: AddContentFieldDto) {
    const contentType = await this.prisma.contentType.findUnique({
      where: { id: contentTypeId },
      include: { fields: true },
    });

    if (!contentType) {
      throw new NotFoundException('İçerik tipi bulunamadı.');
    }

    const slugExists = contentType.fields.some(
      (field) => field.slug === payload.slug,
    );
    if (slugExists) {
      throw new ConflictException('Bu alan slug değeri zaten kullanılıyor.');
    }

    const nextOrder = contentType.fields.length + 1;

    await this.prisma.contentField.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        type: payload.type,
        required: payload.required ?? false,
        order: nextOrder,
        contentTypeId,
      },
    });

    return this.getById(contentTypeId);
  }

  async updateField(
    contentTypeId: string,
    fieldId: string,
    payload: UpdateContentFieldDto,
  ) {
    const contentType = await this.prisma.contentType.findUnique({
      where: { id: contentTypeId },
      include: {
        fields: true,
      },
    });

    if (!contentType) {
      throw new NotFoundException('İçerik tipi bulunamadı.');
    }

    const field = contentType.fields.find((item) => item.id === fieldId);
    if (!field) {
      throw new NotFoundException('Alan bulunamadı.');
    }

    if (payload.slug && payload.slug !== field.slug) {
      const slugExists = contentType.fields.some(
        (item) => item.id !== fieldId && item.slug === payload.slug,
      );
      if (slugExists) {
        throw new ConflictException('Bu alan slug değeri zaten kullanılıyor.');
      }
    }

    await this.prisma.contentField.update({
      where: { id: fieldId },
      data: {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.slug !== undefined ? { slug: payload.slug } : {}),
        ...(payload.type !== undefined ? { type: payload.type } : {}),
        ...(payload.required !== undefined ? { required: payload.required } : {}),
      },
    });

    return this.getById(contentTypeId);
  }

  async removeField(contentTypeId: string, fieldId: string) {
    const contentType = await this.prisma.contentType.findUnique({
      where: { id: contentTypeId },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!contentType) {
      throw new NotFoundException('İçerik tipi bulunamadı.');
    }

    const field = contentType.fields.find((item) => item.id === fieldId);
    if (!field) {
      throw new NotFoundException('Alan bulunamadı.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.contentField.delete({ where: { id: fieldId } });

      const remainingFields = await tx.contentField.findMany({
        where: { contentTypeId },
        orderBy: { order: 'asc' },
      });

      await Promise.all(
        remainingFields.map((item, index) =>
          tx.contentField.update({
            where: { id: item.id },
            data: { order: index + 1 },
          }),
        ),
      );
    });

    return this.getById(contentTypeId);
  }

  async update(id: string, payload: UpdateContentTypeDto) {
    try {
      return await this.prisma.contentType.update({
        where: { id },
        data: {
          ...(payload.name !== undefined ? { name: payload.name } : {}),
          ...(payload.slug !== undefined ? { slug: payload.slug } : {}),
          ...(payload.description !== undefined
            ? { description: payload.description }
            : {}),
        },
        include: {
          fields: {
            orderBy: { order: 'asc' },
          },
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Bu slug ile bir içerik tipi zaten mevcut.',
        );
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('İçerik tipi bulunamadı.');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.contentType.delete({ where: { id } });
      return { success: true };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('İçerik tipi bulunamadı.');
      }
      throw error;
    }
  }
}
