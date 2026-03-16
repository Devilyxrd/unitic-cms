import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiTags,
  ApiUnsupportedMediaTypeResponse,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { MediaService } from './media.service';

@ApiTags('Medya')
@ApiBearerAuth('bearer')
@Controller('media')
@Roles(Role.ADMIN, Role.EDITOR)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiOperation({
    summary: 'Medya listesini getir',
    description: 'Yuklenen medya dosyalarini listeler.',
  })
  @ApiOkResponse({ description: 'Medya listesi donduruldu.' })
  list() {
    return this.mediaService.list();
  }

  @Post()
  @ApiOperation({
    summary: 'Medya yukle',
    description: 'Tek bir dosyayi medya kutuphanesine yukler. Desteklenen turler: resimler (JPEG, PNG, GIF, WebP, SVG), PDF, ofis dokumentleri (DOC, DOCX, XLS, XLSX), metin dosyalari, ses, video.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Yuklenecek dosya (max 10 MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({ description: 'Medya basariyla yuklendi.' })
  @ApiPayloadTooLargeResponse({ description: 'Dosya boyutu 10 MB limiti asamaz.' })
  @ApiUnsupportedMediaTypeResponse({ description: 'Desteklenmeyen dosya turu.' })
  @ApiForbiddenResponse({ description: 'Yalnizca ADMIN ve EDITOR yukleme yapabilir.' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.mediaService.upload(file);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Medyayi sil',
    description: 'Belirtilen medya kaydini ve dosyasini siler.',
  })
  @ApiOkResponse({ description: 'Medya silindi.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erisebilir.' })
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
