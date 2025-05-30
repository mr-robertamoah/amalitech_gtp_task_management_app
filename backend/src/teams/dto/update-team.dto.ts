import { IsIn, IsOptional, IsString } from 'class-validator';

// Create UpdateTeamDto
export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  name: string;
  @IsString()
  @IsOptional()
  description: string;
  @IsString()
  @IsOptional()
  @IsIn(['public', 'private'])
  privacy: 'public' | 'private';
}
