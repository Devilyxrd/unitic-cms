import { Injectable, NotFoundException } from '@nestjs/common';
import { EntryStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PublicContentService {
  constructor(private readonly prisma: PrismaService) {}

  async listByContentType(contentTypeSlug: string) {
    const entries = await this.prisma.entry.findMany({
      where: {
        status: EntryStatus.PUBLISHED,
        contentType: { slug: contentTypeSlug },
      },
      include: { values: true },
      orderBy: { publishedAt: 'desc' },
    });

    return { data: entries, total: entries.length };
  }

  async getBySlug(contentTypeSlug: string, entrySlug: string) {
    const entry = await this.prisma.entry.findFirst({
      where: {
        status: EntryStatus.PUBLISHED,
        slug: entrySlug,
        contentType: { slug: contentTypeSlug },
      },
      include: {
        values: true,
      },
    });

    if (!entry) {
      throw new NotFoundException('Yayınlanmış içerik bulunamadı.');
    }

    return entry;
  }
}
