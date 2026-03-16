import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
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

    if (!file.mimetype || !file.mimetype.includes('/')) {
      throw new BadRequestException('Dosya türü geçersiz.');
    }

    await mkdir(this.uploadDir, { recursive: true });

    const extension = this.resolveExtension(file.originalname);
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
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${filename}`,
      },
    });
  }

  private resolveExtension(name: string) {
    const lastDot = name.lastIndexOf('.');
    if (lastDot === -1) {
      return '';
    }

    return name.slice(lastDot);
  }
}
