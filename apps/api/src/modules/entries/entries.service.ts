import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntryStatus, FieldType, Prisma } from '@prisma/client';
import { AuthUser } from '../../common/types/auth-user';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';

@Injectable()
export class EntriesService {
  constructor(private readonly prisma: PrismaService) {}

  private canManageEntry(actor: AuthUser): boolean {
    return actor.role === 'ADMIN' || actor.role === 'EDITOR';
  }

  async list(contentTypeSlug?: string, status?: EntryStatus) {
    const where: Prisma.EntryWhereInput = {
      ...(contentTypeSlug ? { contentType: { slug: contentTypeSlug } } : {}),
      ...(status ? { status } : {}),
    };

    const entries = await this.prisma.entry.findMany({
      where,
      include: {
        values: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return { data: entries, total: entries.length };
  }

  async getById(id: string, actor?: AuthUser) {
    const entry = await this.prisma.entry.findUnique({
      where: { id },
      include: {
        values: true,
      },
    });

    if (!entry) {
      throw new NotFoundException('Kayıt bulunamadı.');
    }

    if (actor && !this.canManageEntry(actor)) {
      throw new ForbiddenException('Bu kaydı görüntüleme yetkiniz yok.');
    }

    return entry;
  }

  async create(
    contentTypeSlug: string,
    payload: CreateEntryDto,
    actor: AuthUser,
  ) {
    const contentType = await this.prisma.contentType.findUnique({
      where: { slug: contentTypeSlug },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!contentType) {
      throw new NotFoundException('İçerik tipi bulunamadı.');
    }

    if (contentType.fields.length === 0) {
      throw new BadRequestException(
        'Bu içerik tipinde alan tanımı yok. Kayıt oluşturmak için önce alan ekleyin.',
      );
    }

    this.validateEntryValues(contentType.fields, payload.values);

    const inputSlug = payload.slug?.trim();
    const autoSlugSource = this.findSlugSource(
      contentType.fields,
      payload.values,
    );
    const fallbackSlug = `${contentType.slug}-${Date.now()}`;
    const baseSlug = this.toSlug(inputSlug || autoSlugSource || fallbackSlug);
    const finalSlug = await this.ensureUniqueSlug(baseSlug || fallbackSlug);

    const valuesPayload = payload.values.map((value) => ({
      fieldId: value.fieldId,
      value: value.value as Prisma.InputJsonValue,
      mediaId: value.mediaId ?? null,
    }));

    try {
      return await this.prisma.entry.create({
        data: {
          slug: finalSlug,
          status: payload.status,
          publishedAt:
            payload.status === EntryStatus.PUBLISHED ? new Date() : null,
          contentTypeId: contentType.id,
          authorId: actor.id,
          values: {
            create: valuesPayload,
          },
        },
        include: {
          values: true,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Bu slug ile bir kayıt zaten mevcut.');
      }
      throw error;
    }
  }

  private findSlugSource(
    fields: Array<{
      id: string;
      type: FieldType;
      required: boolean;
      name: string;
    }>,
    values: CreateEntryDto['values'],
  ): string | null {
    const valueMap = new Map(values.map((item) => [item.fieldId, item.value]));

    const titleLikeField = fields.find((field) => {
      if (field.type !== FieldType.TEXT && field.type !== FieldType.RICHTEXT) {
        return false;
      }

      const normalized = field.name.toLocaleLowerCase('tr-TR');
      return normalized.includes('başlık') || normalized.includes('title');
    });

    if (titleLikeField) {
      const titleValue = valueMap.get(titleLikeField.id);
      if (typeof titleValue === 'string' && titleValue.trim()) {
        return titleValue;
      }
    }

    for (const field of fields) {
      if (field.type !== FieldType.TEXT && field.type !== FieldType.RICHTEXT) {
        continue;
      }

      const fieldValue = valueMap.get(field.id);
      if (typeof fieldValue === 'string' && fieldValue.trim()) {
        return fieldValue;
      }
    }

    return null;
  }

  private toSlug(input: string): string {
    const trMap: Record<string, string> = {
      ç: 'c',
      ğ: 'g',
      ı: 'i',
      ö: 'o',
      ş: 's',
      ü: 'u',
      Ç: 'c',
      Ğ: 'g',
      İ: 'i',
      I: 'i',
      Ö: 'o',
      Ş: 's',
      Ü: 'u',
    };

    const normalized = input
      .split('')
      .map((char) => trMap[char] ?? char)
      .join('')
      .toLowerCase();

    return normalized
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let candidate = baseSlug;
    let index = 2;

    while (true) {
      const existing = await this.prisma.entry.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });

      if (!existing) {
        return candidate;
      }

      candidate = `${baseSlug}-${index}`;
      index += 1;
    }
  }

  async update(id: string, payload: UpdateEntryDto, actor?: AuthUser) {
    const entry = await this.prisma.entry.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!entry) {
      throw new NotFoundException('Kayıt bulunamadı.');
    }

    if (actor && !this.canManageEntry(actor)) {
      throw new ForbiddenException('Bu kaydı düzenleme yetkiniz yok.');
    }

    const valuesPayload = (payload.values ?? []).map((value) => ({
      fieldId: value.fieldId,
      value: value.value as Prisma.InputJsonValue,
      mediaId: value.mediaId ?? null,
    }));

    try {
      return await this.prisma.entry.update({
        where: { id },
        data: {
          ...(payload.slug !== undefined ? { slug: payload.slug } : {}),
          ...(payload.status !== undefined
            ? {
                status: payload.status,
                publishedAt:
                  payload.status === EntryStatus.PUBLISHED ? new Date() : null,
              }
            : {}),
          values: {
            deleteMany: {},
            create: valuesPayload,
          },
        },
        include: {
          values: true,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Bu slug ile bir kayıt zaten mevcut.');
      }
      throw error;
    }
  }

  async updateStatus(id: string, status: EntryStatus, actor?: AuthUser) {
    const entry = await this.prisma.entry.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!entry) {
      throw new NotFoundException('Kayıt bulunamadı.');
    }

    if (actor && !this.canManageEntry(actor)) {
      throw new ForbiddenException(
        'Bu kaydın durumunu değiştirme yetkiniz yok.',
      );
    }

    try {
      return await this.prisma.entry.update({
        where: { id },
        data: {
          status,
          publishedAt: status === EntryStatus.PUBLISHED ? new Date() : null,
        },
        include: {
          values: true,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Kayıt bulunamadı.');
      }
      throw error;
    }
  }

  async remove(id: string, actor?: AuthUser) {
    const entry = await this.prisma.entry.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!entry) {
      throw new NotFoundException('Kayıt bulunamadı.');
    }

    if (actor && !this.canManageEntry(actor)) {
      throw new ForbiddenException('Bu kaydı silme yetkiniz yok.');
    }

    try {
      await this.prisma.entry.delete({
        where: { id },
      });

      return { success: true };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Kayıt bulunamadı.');
      }
      throw error;
    }
  }

  private validateEntryValues(
    fields: Array<{
      id: string;
      type: FieldType;
      required: boolean;
      name: string;
    }>,
    values: CreateEntryDto['values'],
  ) {
    const fieldMap = new Map(fields.map((field) => [field.id, field]));

    for (const value of values) {
      const field = fieldMap.get(value.fieldId);
      if (!field) {
        throw new BadRequestException(`Geçersiz alan id: ${value.fieldId}`);
      }

      if (field.type === FieldType.MEDIA) {
        if (!value.mediaId) {
          throw new BadRequestException(
            `${field.name} alanı için mediaId zorunludur.`,
          );
        }
        continue;
      }

      if (
        field.required &&
        (value.value === null ||
          value.value === undefined ||
          value.value === '')
      ) {
        throw new BadRequestException(`${field.name} alanı zorunludur.`);
      }

      if (value.value !== undefined && value.value !== null) {
        this.assertType(field.type, value.value, field.name);
      }
    }

    for (const field of fields) {
      if (!field.required) {
        continue;
      }

      const provided = values.find((value) => value.fieldId === field.id);
      if (!provided) {
        throw new BadRequestException(`${field.name} alanı zorunludur.`);
      }
    }
  }

  private assertType(type: FieldType, value: unknown, fieldName: string) {
    switch (type) {
      case FieldType.TEXT:
      case FieldType.RICHTEXT:
      case FieldType.DATE:
        if (typeof value !== 'string') {
          throw new BadRequestException(`${fieldName} alanı metin olmalıdır.`);
        }
        if (type === FieldType.DATE && Number.isNaN(Date.parse(value))) {
          throw new BadRequestException(
            `${fieldName} alanı geçerli bir tarih olmalıdır.`,
          );
        }
        break;
      case FieldType.NUMBER:
        if (typeof value !== 'number') {
          throw new BadRequestException(`${fieldName} alanı sayı olmalıdır.`);
        }
        break;
      case FieldType.BOOLEAN:
        if (typeof value !== 'boolean') {
          throw new BadRequestException(
            `${fieldName} alanı true/false olmalıdır.`,
          );
        }
        break;
      case FieldType.MEDIA:
        break;
      default:
        throw new BadRequestException(`${fieldName} alan tipi desteklenmiyor.`);
    }
  }
}
