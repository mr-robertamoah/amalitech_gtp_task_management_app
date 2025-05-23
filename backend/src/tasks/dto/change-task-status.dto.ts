import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeTaskStatusDto {
  @IsString()
  @IsNotEmpty()
  status: 'pending' | 'in-progress' | 'done';
}
