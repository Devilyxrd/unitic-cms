import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EntryStatus, Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthUser } from '../../common/types/auth-user';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { UpdateEntryStatusDto } from './dto/update-entry-status.dto';
import { EntriesService } from './entries.service';

@ApiTags('Kayitlar')
@ApiBearerAuth('bearer')
@Controller('entries')
@Roles(Role.ADMIN, Role.EDITOR)
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Get()
  @ApiOperation({
    summary: 'Kayitlari listele',
    description: 'Icerik tipi ve durum filtreleriyle kayit listesi getirir.',
  })
  @ApiQuery({
    name: 'contentType',
    required: false,
    description: 'Icerik tipi slug degeri (ornek: blog-yazisi).',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: EntryStatus,
    description: 'Kayit durumu filtresi.',
  })
  @ApiOkResponse({ description: 'Kayit listesi donduruldu.' })
  list(
    @Query('contentType') contentTypeSlug?: string,
    @Query('status') status?: EntryStatus,
  ) {
    return this.entriesService.list(contentTypeSlug, status);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Kayit detayi',
    description: 'Belirli bir kaydi degerleriyle getirir.',
  })
  @ApiOkResponse({ description: 'Kayit detayi donduruldu.' })
  getById(@Param('id') id: string) {
    return this.entriesService.getById(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Kayit olustur',
    description: 'Belirli bir icerik tipinde yeni kayit olusturur.',
  })
  @ApiQuery({
    name: 'contentType',
    required: true,
    description: 'Kaydin olusturulacagi icerik tipi slug degeri.',
  })
  @ApiOkResponse({ description: 'Kayit olusturuldu.' })
  create(
    @Query('contentType') contentTypeSlug: string,
    @Body() body: CreateEntryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.entriesService.create(contentTypeSlug, body, user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Kaydi guncelle',
    description: 'Slug, durum ve alan degerlerini gunceller.',
  })
  @ApiOkResponse({ description: 'Kayit guncellendi.' })
  update(@Param('id') id: string, @Body() body: UpdateEntryDto) {
    return this.entriesService.update(id, body);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Kayit durumunu guncelle',
    description: 'Kaydi DRAFT veya PUBLISHED durumuna gecirir.',
  })
  @ApiOkResponse({ description: 'Kayit durumu guncellendi.' })
  updateStatus(@Param('id') id: string, @Body() body: UpdateEntryStatusDto) {
    return this.entriesService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Kaydi sil',
    description: 'Belirli bir kaydi kalici olarak siler.',
  })
  @ApiOkResponse({ description: 'Kayit silindi.' })
  remove(@Param('id') id: string) {
    return this.entriesService.remove(id);
  }
}
