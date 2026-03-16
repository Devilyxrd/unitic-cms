import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const databaseUrl =
      process.env.DATABASE_URL ??
      'postgresql://devilyxrd:devilyxrdwashere123@localhost:5432/cms';
    const adapter = new PrismaPg({ connectionString: databaseUrl });

    super({
      adapter,
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  enableShutdownHooks() {
    // Prisma v7 no longer exposes beforeExit event in the client typings.
  }
}
