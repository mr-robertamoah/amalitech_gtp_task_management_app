import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':userId')
  async getUserById(@Param('userId') userId: string) {
    const user = await this.usersService.getUser(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.updateUser(userId, updateUserDto);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':userId/change-password')
  async changePassword(
    @Param('userId') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const user = await this.usersService.changeUserPassword(
      userId,
      changePasswordDto,
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
