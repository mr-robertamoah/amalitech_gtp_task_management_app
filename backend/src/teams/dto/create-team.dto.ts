import { IsIn, IsNotEmpty, IsString } from 'class-validator';

// Create CreateTeamDto
export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  description: string;
  @IsString()
  @IsIn(['public', 'private'])
  privacy: 'public' | 'private';
}
