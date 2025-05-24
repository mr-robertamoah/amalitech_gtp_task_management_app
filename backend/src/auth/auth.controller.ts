import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './get-user.decorator';
import { User } from 'src/users/interfaces/users.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  logout(@GetUser() user: User | null) {
    return this.authService.logout(user);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }
}
