import { IsArray, IsNotEmpty, IsString } from 'class-validator';

// Create InviteUsersDto
export class InviteUsersDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  userIds: Array<string>;
}
