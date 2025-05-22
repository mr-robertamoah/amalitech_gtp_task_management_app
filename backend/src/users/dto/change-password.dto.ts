import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { PasswordsNotEqual } from '../validators/password-not-equal.validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @PasswordsNotEqual({ message: 'Old and new passwords must be different' })
  newPassword: string;
}
