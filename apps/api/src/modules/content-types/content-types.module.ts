import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ContentTypesController } from './content-types.controller';
import { ContentTypesService } from './content-types.service';

@Module({
  imports: [PrismaModule],
  controllers: [ContentTypesController],
  providers: [ContentTypesService],
})
export class ContentTypesModule {}
