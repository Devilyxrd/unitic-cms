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

@ApiTags('Icerik Tipleri')
@ApiBearerAuth('bearer')
@Controller('content-types')
export class ContentTypesController {
  constructor(private readonly contentTypesService: ContentTypesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Icerik tiplerini listele',
    description: 'Tum icerik tipi semalarini ve alanlarini getirir.',
  })
  @ApiOkResponse({ description: 'Icerik tipleri donduruldu.' })
  list() {
    return this.contentTypesService.list();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Icerik tipi detayi',
    description: 'Icerik tipini alanlari ile birlikte getirir.',
  })
  @ApiOkResponse({ description: 'Icerik tipi detayi donduruldu.' })
  getById(@Param('id') id: string) {
    return this.contentTypesService.getById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Icerik tipi olustur',
    description: 'Yeni bir icerik tipi semasi olusturur.',
  })
  @ApiOkResponse({ description: 'Icerik tipi olusturuldu.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erisebilir.' })
  create(@Body() body: CreateContentTypeDto) {
    return this.contentTypesService.create(body);
  }

  @Post(':id/fields')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Icerik tipine alan ekle',
    description: 'Belirtilen icerik tipine yeni bir alan tanimi ekler.',
  })
  @ApiOkResponse({ description: 'Alan eklendi, guncel sema donduruldu.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erisebilir.' })
  addField(@Param('id') id: string, @Body() body: AddContentFieldDto) {
    return this.contentTypesService.addField(id, body);
  }

  @Patch(':id/fields/:fieldId')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Icerik tipi alanini guncelle',
    description: 'Belirtilen alanin ad, slug, tip ve zorunluluk degerlerini gunceller.',
  })
  @ApiOkResponse({ description: 'Alan guncellendi, guncel sema donduruldu.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erisebilir.' })
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
    summary: 'Icerik tipi alanini sil',
    description: 'Belirtilen alanı siler ve kalan alan siralarini duzeltir.',
  })
  @ApiOkResponse({ description: 'Alan silindi, guncel sema donduruldu.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erisebilir.' })
  removeField(@Param('id') id: string, @Param('fieldId') fieldId: string) {
    return this.contentTypesService.removeField(id, fieldId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Icerik tipini guncelle',
    description: 'Icerik tipinin ad, slug ve aciklama alanlarini gunceller.',
  })
  @ApiOkResponse({ description: 'Icerik tipi guncellendi.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erisebilir.' })
  update(@Param('id') id: string, @Body() body: UpdateContentTypeDto) {
    return this.contentTypesService.update(id, body);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Icerik tipini sil',
    description: 'Icerik tipi ve iliskili kayitlarini siler.',
  })
  @ApiOkResponse({ description: 'Icerik tipi silindi.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erisebilir.' })
  remove(@Param('id') id: string) {
    return this.contentTypesService.remove(id);
  }
}
