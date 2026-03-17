import { Injectable, NotFoundException } from '@nestjs/common';
import { EntryStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PublicContentService {
  constructor(private readonly prisma: PrismaService) {}

  async listAllPublished() {
    const entries = await this.prisma.entry.findMany({
      where: { status: EntryStatus.PUBLISHED },
      include: {
        contentType: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        values: {
          include: {
            field: true,
            media: true,
          },
        },
      },
      orderBy: [{ contentType: { slug: 'asc' } }, { publishedAt: 'desc' }],
    });

    if (entries.length === 0) {
      return { data: [], totalContentTypes: 0, totalEntries: 0 };
    }

    const groupedMap = new Map<
      string,
      {
        contentType: { id: string; name: string; slug: string };
        entries: typeof entries;
      }
    >();

    for (const entry of entries) {
      const existing = groupedMap.get(entry.contentTypeId);
      if (existing) {
        existing.entries.push(entry);
        continue;
      }

      groupedMap.set(entry.contentTypeId, {
        contentType: entry.contentType,
        entries: [entry],
      });
    }

    const data = Array.from(groupedMap.values())
      .map((group) => ({
        ...group,
        totalPublishedEntries: group.entries.length,
      }))
      .sort((a, b) => b.totalPublishedEntries - a.totalPublishedEntries);

    return {
      data,
      totalContentTypes: data.length,
      totalEntries: entries.length,
    };
  }

  async listContentTypes() {
    const grouped = await this.prisma.entry.groupBy({
      by: ['contentTypeId'],
      where: { status: EntryStatus.PUBLISHED },
      _count: { _all: true },
    });

    if (grouped.length === 0) {
      return { data: [], total: 0 };
    }

    const contentTypes = await this.prisma.contentType.findMany({
      where: {
        id: { in: grouped.map((item) => item.contentTypeId) },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    const countByTypeId = new Map(
      grouped.map((item) => [item.contentTypeId, item._count._all]),
    );

    const data = contentTypes
      .map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        totalPublishedEntries: countByTypeId.get(item.id) ?? 0,
      }))
      .sort((a, b) => b.totalPublishedEntries - a.totalPublishedEntries);

    return { data, total: data.length };
  }

  async listByContentType(contentTypeSlug: string) {
    const entries = await this.prisma.entry.findMany({
      where: {
        status: EntryStatus.PUBLISHED,
        contentType: { slug: contentTypeSlug },
      },
      include: {
        values: {
          include: {
            field: true,
            media: true,
          },
        },
      },
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
        values: {
          include: {
            field: true,
            media: true,
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException('Yayınlanmış içerik bulunamadı.');
    }

    return entry;
  }
}
