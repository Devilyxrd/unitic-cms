import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PublicContentService } from './public-content.service';

@ApiTags('Public Icerik')
@Controller('public')
@Public()
export class PublicContentController {
  constructor(private readonly publicContentService: PublicContentService) {}

  @Get(':contentTypeSlug')
  @ApiOperation({
    summary: 'Yayinlanmis icerikleri listele',
    description:
      'Belirtilen icerik tipi slug degerine ait yayinlanmis kayitlari getirir.',
  })
  @ApiOkResponse({ description: 'Yayinlanmis icerikler donduruldu.' })
  list(@Param('contentTypeSlug') contentTypeSlug: string) {
    return this.publicContentService.listByContentType(contentTypeSlug);
  }

  @Get(':contentTypeSlug/:entrySlug')
  @ApiOperation({
    summary: 'Yayinlanmis icerik detayi',
    description:
      'Belirtilen icerik tipi ve entry slug degeriyle tek bir yayinlanmis icerik getirir.',
  })
  @ApiOkResponse({ description: 'Yayinlanmis icerik detayi donduruldu.' })
  getBySlug(
    @Param('contentTypeSlug') contentTypeSlug: string,
    @Param('entrySlug') entrySlug: string,
  ) {
    return this.publicContentService.getBySlug(contentTypeSlug, entrySlug);
  }
}
