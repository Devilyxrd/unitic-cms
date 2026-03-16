import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { AddContentFieldDto } from './dto/add-content-field.dto';
import { CreateContentTypeDto } from './dto/create-content-type.dto';
import { ContentTypesService } from './content-types.service';
import { UpdateContentTypeDto } from './dto/update-content-type.dto';
import { UpdateContentFieldDto } from './dto/update-content-field.dto';

@ApiTags('İçerik Tipleri')
@ApiBearerAuth('bearer')
@Controller('content-types')
export class ContentTypesController {
  constructor(private readonly contentTypesService: ContentTypesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'İçerik tiplerini listele',
    description: 'Tüm içerik tipi şemalarını ve alanlarını getirir.',
  })
  @ApiOkResponse({ description: 'İçerik tipleri döndürüldü.' })
  list() {
    return this.contentTypesService.list();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'İçerik tipi detayı',
    description: 'İçerik tipini alanları ile birlikte getirir.',
  })
  @ApiOkResponse({ description: 'İçerik tipi detayı döndürüldü.' })
  getById(@Param('id') id: string) {
    return this.contentTypesService.getById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'İçerik tipi oluştur',
    description: 'Yeni bir içerik tipi şeması oluşturur.',
  })
  @ApiOkResponse({ description: 'İçerik tipi oluşturuldu.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erişebilir.' })
  create(@Body() body: CreateContentTypeDto) {
    return this.contentTypesService.create(body);
  }

  @Post(':id/fields')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'İçerik tipine alan ekle',
    description: 'Belirtilen içerik tipine yeni bir alan tanımı ekler.',
  })
  @ApiOkResponse({ description: 'Alan eklendi, güncel şema döndürüldü.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erişebilir.' })
  addField(@Param('id') id: string, @Body() body: AddContentFieldDto) {
    return this.contentTypesService.addField(id, body);
  }

  @Patch(':id/fields/:fieldId')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'İçerik tipi alanını güncelle',
    description:
      'Belirtilen alanın ad, slug, tip ve zorunluluk değerlerini günceller.',
  })
  @ApiOkResponse({ description: 'Alan güncellendi, güncel şema döndürüldü.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erişebilir.' })
  updateField(
    @Param('id') id: string,
    @Param('fieldId') fieldId: string,
    @Body() body: UpdateContentFieldDto,
  ) {
    return this.contentTypesService.updateField(id, fieldId, body);
  }

  @Delete(':id/fields/:fieldId')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'İçerik tipi alanını sil',
    description: 'Belirtilen alanı siler ve kalan alan sıralarını düzeltir.',
  })
  @ApiOkResponse({ description: 'Alan silindi, güncel şema döndürüldü.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erişebilir.' })
  removeField(@Param('id') id: string, @Param('fieldId') fieldId: string) {
    return this.contentTypesService.removeField(id, fieldId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'İçerik tipini güncelle',
    description: 'İçerik tipinin ad, slug ve açıklama alanlarını günceller.',
  })
  @ApiOkResponse({ description: 'İçerik tipi güncellendi.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erişebilir.' })
  update(@Param('id') id: string, @Body() body: UpdateContentTypeDto) {
    return this.contentTypesService.update(id, body);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'İçerik tipini sil',
    description: 'İçerik tipi ve ilişkili kayıtlarını siler.',
  })
  @ApiOkResponse({ description: 'İçerik tipi silindi.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erişebilir.' })
  remove(@Param('id') id: string) {
    return this.contentTypesService.remove(id);
  }
}
