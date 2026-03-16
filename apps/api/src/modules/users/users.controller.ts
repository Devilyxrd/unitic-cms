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
import { CreateUserDto } from './dto/create-user.dto';
import { SetUserActiveDto } from './dto/set-user-active.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Kullanıcılar')
@ApiBearerAuth('bearer')
@Controller('users')
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Kullanıcıları listele',
    description: 'Sistemdeki kullanıcıları oluşturma tarihine göre listeler.',
  })
  @ApiOkResponse({ description: 'Kullanıcı listesi döndürüldü.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erişebilir.' })
  list() {
    return this.usersService.list();
  }

  @Post()
  @ApiOperation({
    summary: 'Yeni kullanıcı oluştur',
    description: 'Yeni bir ADMIN, EDITOR veya USER kullanıcısı oluşturur.',
  })
  @ApiOkResponse({ description: 'Kullanıcı başarıyla oluşturuldu.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erişebilir.' })
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Patch(':id/active')
  @ApiOperation({
    summary: 'Kullanıcı aktiflik durumunu güncelle',
    description: 'Kullanıcıyı aktif veya pasif duruma getirir.',
  })
  @ApiOkResponse({ description: 'Kullanıcı durumu güncellendi.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erişebilir.' })
  setActive(@Param('id') id: string, @Body() body: SetUserActiveDto) {
    return this.usersService.setActive(id, body.active);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Kullanıcı bilgilerini güncelle',
    description: 'E-posta, kullanıcı adı, şifre veya rol bilgisini günceller.',
  })
  @ApiOkResponse({ description: 'Kullanıcı güncellendi.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erişebilir.' })
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Kullanıcıyı sil',
    description: 'Belirtilen kullanıcıyı kalıcı olarak siler.',
  })
  @ApiOkResponse({ description: 'Kullanıcı silindi.' })
  @ApiForbiddenResponse({ description: 'Sadece ADMIN erişebilir.' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
