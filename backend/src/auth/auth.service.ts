import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from 'src/users/interfaces/users.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.getUserByEmail(email);
    // Check if the user exists and if the password matches
    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password))
    ) {
      // Remove password from the user object before returning
      delete user.password;

      return user;
    }
    // If user not found or password doesn't match, return null
    return null;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const payload = { username: user.username, sub: user.userId, email: user.email };
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

  logout(user: User | null) {
    // invalidate jwt token
    if (!user) {
      throw new Error('User not found');
    }

    return { message: 'User logged out successfully' };
  }

  async register(dto: RegisterDto) {
    // Check if the user already exists with the provided username or email
    const existingUser = await this.usersService.getUserByUsernameOrEmail({
      username: dto.username,
      email: dto.email,
    });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = await this.usersService.createUser({
      ...dto,
      password: hashedPassword,
      // Generate a unique UUID for userId
      userId: uuidv4(),
    });

    if (!newUser) {
      throw new Error('User registration failed');
    }
    // Remove password from the newUser object before returning
    delete newUser.password;
    // Generate JWT token
    const payload = { username: newUser.username, sub: newUser.userId, email: newUser.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: newUser,
    };
  }
}
