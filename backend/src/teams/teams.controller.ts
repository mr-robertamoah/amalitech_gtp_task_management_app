import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateTeamDto } from './dto/create-team.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/users/interfaces/users.interface';
import { UpdateTeamDto } from './dto/update-team.dto';

@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':teamId')
  async getTeamById(@Param('teamId') teamId: string) {
    const team = await this.teamsService.getTeamById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('')
  async createTeam(
    @Body() createTeamDto: CreateTeamDto,
    @GetUser() owner: User,
  ) {
    return await this.teamsService.createTeam(owner, createTeamDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':teamId')
  async updateTeam(
    @Body() updateTeamDto: UpdateTeamDto,
    @Param('teamId') teamId: string,
    @GetUser() owner: User,
  ) {
    const team = await this.teamsService.updateTeam(
      owner,
      teamId,
      updateTeamDto,
    );
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':teamId')
  async deleteTeam(@Param('teamId') teamId: string, @GetUser() owner: User) {
    return await this.teamsService.deleteTeam(owner, teamId);
  }

//   @UseGuards(AuthGuard('jwt'))
//   @Post(':teamId/invite-users')
//   async inviteUsersToTeam(@Param('teamId') teamId: string, @Body() inviteUsersDto: InviteUsersDto) {
//     const team = await this.teamsService.inviteUsersToTeam(teamId, inviteUsersDto);
//     if (!team) {
//       throw new NotFoundException('Team not found');
//     }
//     return team;
//   }

//   @UseGuards(AuthGuard('jwt'))
//   @Post(':teamId/remove-users')
//   async removeUsersFromTeam(@Param('teamId') teamId: string, @Body() removeUsersDto: RemoveUsersDto) {
//     const team = await this.teamsService.removeUsersFromTeam(teamId, removeUsersDto);
//     if (!team) {
//       throw new NotFoundException('Team not found');
//     }
//     return team;
//   }

//   @UseGuards(AuthGuard('jwt'))
//   @Post(':teamId/change-role')
//   async changeUserRoleInTeam(@Param('teamId') teamId: string, @Body() changeRoleDto: ChangeRoleDto) {
//     const team = await this.teamsService.changeUserRoleInTeam(teamId, changeRoleDto);
//     if (!team) {
//       throw new NotFoundException('Team not found');
//     }
//     return team;
//   }

//   @UseGuards(AuthGuard('jwt'))
//   @Post(':teamId/respond-to-invitation')
//   async respondToTeamInvitation(@Param('teamId') teamId: string, @Body() respondDto: RespondToInvitationDto) {
//     const team = await this.teamsService.respondToTeamInvitation(teamId, respondDto);
//     if (!team) {
//       throw new NotFoundException('Team not found');
//     }
//     return team;
//   }

//   @UseGuards(AuthGuard('jwt'))
//   @Post(':teamId/leave')
//   async leaveTeam(@Param('teamId') teamId: string) {
//     const team = await this.teamsService.leaveTeam(teamId);
//     if (!team) {
//       throw new NotFoundException('Team not found');
//     }
//     return team;
//   }
}
