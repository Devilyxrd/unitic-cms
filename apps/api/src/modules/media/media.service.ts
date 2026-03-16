import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { PrismaService } from '../../prisma/prisma.service';

type UploadFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class MediaService {
  private readonly maxFileSize = 10 * 1024 * 1024;
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const items = await this.prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { data: items, total: items.length };
  }

  async upload(file: UploadFile | undefined) {
    if (!file) {
      throw new BadRequestException('Yüklenecek dosya bulunamadı.');
    }

    const originalName = file.originalname?.trim();
    if (!originalName) {
      throw new BadRequestException('Dosya adı boş olamaz.');
    }

    if (!Number.isFinite(file.size) || file.size <= 0) {
      throw new BadRequestException('Dosya boyutu geçersiz.');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException('Dosya boyutu 10 MB sınırını aşamaz.');
    }

    if (!file.mimetype || !file.mimetype.includes('/')) {
      throw new BadRequestException('Dosya türü geçersiz.');
    }

    const extension = this.resolveExtension(originalName);
    if (extension && !/^\.[a-zA-Z0-9]+$/.test(extension)) {
      throw new BadRequestException('Dosya uzantısı geçersiz.');
    }

    await mkdir(this.uploadDir, { recursive: true });

    const filename = `${randomUUID()}${extension}`;
    const absolutePath = join(this.uploadDir, filename);

    try {
      await writeFile(absolutePath, file.buffer);
    } catch {
      throw new InternalServerErrorException(
        'Dosya kaydedilirken hata oluştu.',
      );
    }

    return this.prisma.media.create({
      data: {
        filename: originalName,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${filename}`,
      },
    });
  }

  async remove(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });

    if (!media) {
      throw new NotFoundException('Medya bulunamadı.');
    }

    await this.prisma.entryValue.updateMany({
      where: { mediaId: id },
      data: { mediaId: null },
    });

    await this.prisma.media.delete({ where: { id } });

    const fileName = media.url.replace('/uploads/', '');
    const absolutePath = join(this.uploadDir, fileName);
    await unlink(absolutePath).catch(() => undefined);

    return { success: true };
  }

  private resolveExtension(name: string) {
    const lastDot = name.lastIndexOf('.');
    if (lastDot === -1) {
      return '';
    }

    return name.slice(lastDot);
  }
}
