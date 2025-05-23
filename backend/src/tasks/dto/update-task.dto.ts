import { IsIn, IsISO8601, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['pending', 'in-progress', 'done'])
  status?: 'pending' | 'in-progress' | 'done';

  @IsString()
  @IsOptional()
  @IsISO8601()
  startAt?: string;

  @IsString()
  @IsOptional()
  @IsISO8601()
  endAt?: string;
}
