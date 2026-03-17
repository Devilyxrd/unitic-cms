import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
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
  private readonly uploadDir =
    process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads');

  private readonly allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'audio/webm',
  ]);

  private readonly dangerousExtensions = new Set([
    '.exe',
    '.bat',
    '.cmd',
    '.sh',
    '.bash',
    '.ps1',
    '.vbs',
    '.jar',
    '.app',
    '.dmg',
    '.zip',
    '.rar',
    '.7z',
    '.tar',
    '.gz',
  ]);

  constructor(private readonly prisma: PrismaService) {}

  private resolveExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex > 0
      ? filename.substring(lastDotIndex).toLowerCase()
      : '';
  }

  private generateRandomName(length = 24): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = randomBytes(length);
    let generated = '';

    for (let i = 0; i < length; i += 1) {
      generated += chars[bytes[i] % chars.length];
    }

    return generated;
  }

  private normalizeFileBaseName(input: string): string {
    const normalized = input
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!normalized) {
      return 'file';
    }

    return normalized.slice(0, 60).replace(/-+$/g, '') || 'file';
  }

  private buildStorageName(originalName: string, extension: string): string {
    const nameWithoutExtension = originalName.substring(
      0,
      originalName.lastIndexOf('.'),
    );
    const baseName = this.normalizeFileBaseName(nameWithoutExtension);
    const suffix = this.generateRandomName(8);

    return `${baseName}-${suffix}${extension}`;
  }

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

    if (!this.allowedMimeTypes.has(file.mimetype)) {
      throw new BadRequestException(
        `Dosya türü '${file.mimetype}' desteklenmiyor. İzin verilen türler: resimler, PDF, ofis dokümanları, ses/video dosyaları.`,
      );
    }

    const extension = this.resolveExtension(originalName);
    if (!extension) {
      throw new BadRequestException('Dosya uzantısı bulunamadı.');
    }

    if (!/^\.[a-zA-Z0-9]+$/.test(extension)) {
      throw new BadRequestException('Dosya uzantısı geçersiz.');
    }

    if (this.dangerousExtensions.has(extension)) {
      throw new BadRequestException(
        `Dosya uzantısı '${extension}' güvenlik sebebiyle izin verilmiyor.`,
      );
    }

    // Check for double extensions (e.g., file.txt.exe)
    const nameWithoutExtension = originalName.substring(
      0,
      originalName.lastIndexOf('.'),
    );
    const secondaryExtension = this.resolveExtension(nameWithoutExtension);
    if (
      secondaryExtension &&
      this.dangerousExtensions.has(secondaryExtension)
    ) {
      throw new BadRequestException('Çift uzantılı zararlı dosya algılandı.');
    }

    await mkdir(this.uploadDir, { recursive: true });

    const storageName = this.buildStorageName(originalName, extension);
    const absolutePath = join(this.uploadDir, storageName);

    try {
      await writeFile(absolutePath, file.buffer);
    } catch {
      throw new InternalServerErrorException(
        'Dosya kaydedilirken hata oluştu.',
      );
    }

    return this.prisma.media.create({
      data: {
        filename: storageName,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${storageName}`,
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
}
