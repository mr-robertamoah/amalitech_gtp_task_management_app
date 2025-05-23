import { IsIn, IsNotEmpty, IsString } from 'class-validator';

// Create RespondToInvitationDto
export class RespondToInvitationDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['accept', 'reject'])
  response: string;
}
