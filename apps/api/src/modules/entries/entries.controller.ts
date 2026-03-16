import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { EntryStatus, Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthUser } from '../../common/types/auth-user';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { UpdateEntryStatusDto } from './dto/update-entry-status.dto';
import { EntriesService } from './entries.service';

@ApiTags('Kayıtlar')
@ApiBearerAuth('bearer')
@Controller('entries')
@Roles(Role.ADMIN, Role.EDITOR)
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Get('content-type/:contentType')
  @ApiOperation({
    summary: 'Kayıtları listele',
    description: 'İçerik tipi bazlı kayıt listesi getirir.',
  })
  @ApiParam({
    name: 'contentType',
    required: true,
    description: 'İçerik tipi slug değeri (örnek: blog-yazisi).',
  })
  @ApiOkResponse({ description: 'Kayıt listesi döndürüldü.' })
  list(@Param('contentType') contentTypeSlug: string) {
    return this.entriesService.list(contentTypeSlug, undefined);
  }

  @Get('content-type/:contentType/status/:status')
  @ApiOperation({
    summary: 'Kayıtları duruma göre listele',
    description:
      'Belirli içerik tipinde, belirtilen durumdaki kayıtları listeler.',
  })
  @ApiParam({
    name: 'contentType',
    required: true,
    description: 'İçerik tipi slug değeri (örnek: blog-yazisi).',
  })
  @ApiParam({
    name: 'status',
    required: true,
    enum: EntryStatus,
    description: 'Kayıt durumu filtresi.',
  })
  @ApiOkResponse({ description: 'Kayıt listesi döndürüldü.' })
  listByStatus(
    @Param('contentType') contentTypeSlug: string,
    @Param('status') status: EntryStatus,
  ) {
    return this.entriesService.list(contentTypeSlug, status);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Kayıt detayı',
    description: 'Belirli bir kaydı değerleriyle getirir.',
  })
  @ApiOkResponse({ description: 'Kayıt detayı döndürüldü.' })
  getById(@Param('id') id: string, @CurrentUser() user?: AuthUser) {
    return this.entriesService.getById(id, user);
  }

  @Post('content-type/:contentType')
  @ApiOperation({
    summary: 'Kayıt oluştur',
    description: 'Belirli bir içerik tipinde yeni kayıt oluşturur.',
  })
  @ApiParam({
    name: 'contentType',
    required: true,
    description: 'Kaydın oluşturulacağı içerik tipi slug değeri.',
  })
  @ApiOkResponse({ description: 'Kayıt oluşturuldu.' })
  create(
    @Param('contentType') contentTypeSlug: string,
    @Body() body: CreateEntryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.entriesService.create(contentTypeSlug, body, user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Kaydı güncelle',
    description: 'Slug, durum ve alan değerlerini günceller.',
  })
  @ApiOkResponse({ description: 'Kayıt güncellendi.' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateEntryDto,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.entriesService.update(id, body, user);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Kayıt durumunu güncelle',
    description: 'Kaydı DRAFT veya PUBLISHED durumuna geçirir.',
  })
  @ApiOkResponse({ description: 'Kayıt durumu güncellendi.' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateEntryStatusDto,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.entriesService.updateStatus(id, body.status, user);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Kaydı sil',
    description: 'Belirli bir kaydı kalıcı olarak siler.',
  })
  @ApiOkResponse({ description: 'Kayıt silindi.' })
  remove(@Param('id') id: string, @CurrentUser() user?: AuthUser) {
    return this.entriesService.remove(id, user);
  }
}
