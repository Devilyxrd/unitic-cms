import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PublicContentService } from './public-content.service';

@ApiTags('Public İçerik')
@Controller('api/public')
@Public()
export class PublicContentController {
  constructor(private readonly publicContentService: PublicContentService) {}

  @Get()
  @ApiOperation({
    summary: 'Yayınlanan içerik tiplerini listele',
    description:
      'En az bir yayınlanmış kaydı olan içerik tiplerini yayın sayılarıyla birlikte getirir.',
  })
  @ApiOkResponse({
    description: 'Public içerik tipleri döndürüldü.',
  })
  listContentTypes() {
    return this.publicContentService.listContentTypes();
  }

  @Get('all')
  @ApiOperation({
    summary: 'Tüm yayınlanmış içerikleri toplu getir',
    description:
      'Yayında olan tüm entry kayıtlarını içerik tiplerine gruplayarak tek response içinde döndürür.',
  })
  @ApiOkResponse({
    description:
      'Tüm yayınlanmış içerikler içerik tiplerine göre gruplanmış olarak döndürüldü.',
  })
  listAllPublished() {
    return this.publicContentService.listAllPublished();
  }

  @Get(':contentType')
  @ApiOperation({
    summary: 'Yayınlanmış içerikleri listele',
    description:
      'Belirtilen içerik tipi slug değerine ait yayınlanmış kayıtları getirir.',
  })
  @ApiOkResponse({ description: 'Yayınlanmış içerikler döndürüldü.' })
  list(@Param('contentType') contentType: string) {
    return this.publicContentService.listByContentType(contentType);
  }

  @Get(':contentType/:slug')
  @ApiOperation({
    summary: 'Yayınlanmış içerik detayı',
    description:
      'Belirtilen içerik tipi ve entry slug değeriyle tek bir yayınlanmış içerik getirir.',
  })
  @ApiOkResponse({ description: 'Yayınlanmış içerik detayı döndürüldü.' })
  getBySlug(
    @Param('contentType') contentType: string,
    @Param('slug') slug: string,
  ) {
    return this.publicContentService.getBySlug(contentType, slug);
  }
}
