import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    // Check if the user exists and if the password matches
    if (user && await bcrypt.compare(password, user.password)) {
      // Remove password from the user object before returning
      const { password, ...result } = user;

      return result;
    }
    // If user not found or password doesn't match, return null
    return null;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.username, dto.password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        teams: user.teams,
        createdAt: user.createdAt,
      },
    };
  }

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = await this.usersService.createUser({
      ...dto,
      password: hashedPassword,
    });
    const payload = { username: newUser.username, sub: newUser.userId };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        teams: newUser.teams,
        createdAt: newUser.createdAt,
      },
    };
  }
}

