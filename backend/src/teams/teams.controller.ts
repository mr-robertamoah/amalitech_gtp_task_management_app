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
import { InviteUsersDto } from './dto/invite-users.dto';
import { RemoveUsersDto } from './dto/remove-users.dto';
import { RespondToInvitationDto } from './dto/respond-to-invitation.dto';

@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get('public')
  async getPublicTeams() {
    return await this.teamsService.getPublicTeams();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/all')
  async getUserTeams(@GetUser() user: User) {
    return await this.teamsService.getTeams(user);
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

  @UseGuards(AuthGuard('jwt'))
  @Post(':teamId/invite-users')
  async inviteUsersToTeam(
    @Param('teamId') teamId: string,
    @Body() inviteUsersDto: InviteUsersDto,
    @GetUser() owner: User,
  ) {
    const team = await this.teamsService.inviteUsersToTeam(
      owner,
      teamId,
      inviteUsersDto,
    );
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':teamId/remove-users')
  async removeUsersFromTeam(
    @Param('teamId') teamId: string,
    @Body() removeUsersDto: RemoveUsersDto,
    @GetUser() owner: User,
  ) {
    const team = await this.teamsService.removeUsersFromTeam(
      owner,
      teamId,
      removeUsersDto,
    );
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':teamId/ban-members')
  async banUsers(
    @Param('teamId') teamId: string,
    @Body() dto: InviteUsersDto,
    @GetUser() owner: User,
  ) {
    const team = await this.teamsService.banUsers(owner, teamId, dto);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':teamId/activate-members')
  async activateUsers(
    @Param('teamId') teamId: string,
    @Body() dto: InviteUsersDto,
    @GetUser() owner: User,
  ) {
    const team = await this.teamsService.activateUsers(owner, teamId, dto);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':teamId/make-admins')
  async makeAdmins(
    @Param('teamId') teamId: string,
    @Body() dto: InviteUsersDto,
    @GetUser() owner: User,
  ) {
    const team = await this.teamsService.makeAdmins(owner, teamId, dto);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':teamId/make-members')
  async makeMembers(
    @Param('teamId') teamId: string,
    @Body() dto: InviteUsersDto,
    @GetUser() owner: User,
  ) {
    const team = await this.teamsService.makeMembers(owner, teamId, dto);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':teamId/respond-to-invitation')
  async respondToTeamInvitation(
    @Param('teamId') teamId: string,
    @GetUser() user: User,
    @Body() respondDto: RespondToInvitationDto,
  ) {
    const team = await this.teamsService.respondToTeamInvitation(
      user,
      teamId,
      respondDto,
    );
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':teamId/leave')
  async leaveTeam(@Param('teamId') teamId: string, @GetUser() user: User) {
    const team = await this.teamsService.leaveTeam(user, teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

//   @UseGuards(AuthGuard('jwt'))
//   @Post(':teamId/respond-to-request')
//   async respondToTeamRequest(
//     @Param('teamId') teamId: string,
//     @GetUser() user: User,
//     @Body() respondDto: RespondToInvitationDto,
//   ) {
//     const team = await this.teamsService.respondToTeamRequest(
//       user,
//       teamId,
//       respondDto,
//     );
//     if (!team) {
//       throw new NotFoundException('Team not found');
//     }
//     return team;
//   }

//   @UseGuards(AuthGuard('jwt'))
//   @Post(':teamId/request-membership')
//   async requestMembership(
//     @Param('teamId') teamId: string,
//     @GetUser() owner: User,
//   ) {
//     const team = await this.teamsService.requestMembership(owner, teamId);
//     if (!team) {
//       throw new NotFoundException('Team not found');
//     }
//     return team;
//   }

  @Get(':teamId/members')
  async getTeamMembers(
    @Param('teamId') teamId: string,
    @GetUser() user: User | null,
  ) {
    return await this.teamsService.getMembers(user, teamId);
  }

  @Get(':teamId/projects')
  async getProjects(
    @Param('teamId') teamId: string,
    @GetUser() user: User | null,
  ) {
    return await this.teamsService.getProjects(user, teamId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':teamId')
  async getTeam(@Param('teamId') teamId: string, @GetUser() user: User) {
    const team = await this.teamsService.getTeam(user, teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  @Get(':teamId/public')
  async getPublicTeam(@Param('teamId') teamId: string) {
    const team = await this.teamsService.getPublicTeam(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }
}
