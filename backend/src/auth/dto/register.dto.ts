import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
