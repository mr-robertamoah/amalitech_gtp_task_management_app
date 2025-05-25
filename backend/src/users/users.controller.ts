import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from './interfaces/users.interface';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  async changePassword(
    @GetUser() owner: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    try {
      const user = await this.usersService.changeUserPassword(
        owner.userId,
        changePasswordDto,
      );
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error.message) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('search/')
  async searchUsers(@Query('q') userOrUsername: string) {
    const user = await this.usersService.searchUsers(userOrUsername);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':userId')
  async getUserById(@Param('userId') userId: string) {
    const user = await this.usersService.getUser(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get('')
  async getUsers() {
    return await this.usersService.getUsers();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const user = await this.usersService.updateUser(userId, updateUserDto);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error.message) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':userId')
  async deleteUser(@Param('userId') userId: string) {
    return await this.usersService.deleteUser(userId);
  }
}
