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
    description: 'Yüklenen medya dosyalarını listeler.',
  })
  @ApiOkResponse({ description: 'Medya listesi döndürüldü.' })
  list() {
    return this.mediaService.list();
  }

  @Post()
  @ApiOperation({
    summary: 'Medya yükle',
    description:
      'Tek bir dosyayı medya kütüphanesine yükler. Desteklenen türler: resimler (JPEG, PNG, GIF, WebP, SVG).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Yüklenecek dosya (max 10 MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({ description: 'Medya başarıyla yüklendi.' })
  @ApiPayloadTooLargeResponse({
    description: 'Dosya boyutu 10 MB limiti aşamaz.',
  })
  @ApiUnsupportedMediaTypeResponse({
    description: 'Desteklenmeyen dosya türü.',
  })
  @ApiForbiddenResponse({
    description: 'Yalnızca ADMIN ve EDITOR yükleme yapabilir.',
  })
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
    summary: 'Medyayı sil',
    description: 'Belirtilen medya kaydını ve dosyasını siler.',
  })
  @ApiOkResponse({ description: 'Medya silindi.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erişebilir.' })
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
