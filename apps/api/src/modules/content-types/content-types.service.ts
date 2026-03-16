import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AddContentFieldDto } from './dto/add-content-field.dto';
import { CreateContentTypeDto } from './dto/create-content-type.dto';

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
}
