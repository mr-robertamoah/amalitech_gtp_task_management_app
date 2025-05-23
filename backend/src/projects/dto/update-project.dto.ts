import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsISO8601()
  startAt?: string;

  @IsString()
  @IsOptional()
  @IsISO8601()
  endAt?: string;

  @IsString()
  teamId: string;
}
