import { IsArray, IsNotEmpty, IsString } from 'class-validator';

// Create RemoveUsersDto
export class RemoveUsersDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  userIds: Array<string>;
}
