import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PublicContentController } from './public-content.controller';
import { PublicContentService } from './public-content.service';

@Module({
  imports: [PrismaModule],
  controllers: [PublicContentController],
  providers: [PublicContentService],
})
export class PublicContentModule {}
