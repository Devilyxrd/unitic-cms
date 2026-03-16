import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { SetUserActiveDto } from './dto/set-user-active.dto';
import { UsersService } from './users.service';

@ApiTags('Kullanicilar')
@ApiBearerAuth('bearer')
@Controller('users')
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Kullanicilari listele',
    description: 'Sistemdeki kullanicilari olusturma tarihine gore listeler.',
  })
  @ApiOkResponse({ description: 'Kullanici listesi donduruldu.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erisebilir.' })
  list() {
    return this.usersService.list();
  }

  @Post()
  @ApiOperation({
    summary: 'Yeni kullanici olustur',
    description: 'Yeni bir ADMIN veya EDITOR kullanicisi olusturur.',
  })
  @ApiOkResponse({ description: 'Kullanici basariyla olusturuldu.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erisebilir.' })
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Patch(':id/active')
  @ApiOperation({
    summary: 'Kullanici aktiflik durumunu guncelle',
    description: 'Kullaniciyi aktif veya pasif duruma getirir.',
  })
  @ApiOkResponse({ description: 'Kullanici durumu guncellendi.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erisebilir.' })
  setActive(@Param('id') id: string, @Body() body: SetUserActiveDto) {
    return this.usersService.setActive(id, body.active);
  }
}
