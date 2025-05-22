import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

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
}
