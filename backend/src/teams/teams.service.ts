import { User } from 'src/users/interfaces/users.interface';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { Team, UserMembership } from './interfaces/teams.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @Inject('DYNAMO_CLIENT') private readonly db: DynamoDBDocumentClient,
  ) {}

  async getTeamAndMembersById(teamId: string): Promise<Team | null> {
    const team = await this.getTeamById(teamId);

    if (!team) {
      return null;
    }

    return {
      ...team,
      members: await this.getTeamMembers(teamId),
    };
  }

  async getTeamById(
    teamId: string,
    withMembers: boolean = true,
  ): Promise<Team | null> {
    const res = await this.db.send(
      new GetCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Key: {
          PK: `TEAM#${teamId}`,
          SK: 'METADATA',
        },
      }),
    );

    if (!res.Item) {
      return null;
    }

    return await this.getTeamData(res.Item as Team, withMembers);
  }

  private async getTeamMembers(teamId: string): Promise<UserMembership[]> {
    const members = await this.db.send(
      new QueryCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        KeyConditionExpression: 'PK = :PK AND begins_with(SK, :SK)',
        ExpressionAttributeValues: {
          ':PK': `TEAM#${teamId}`,
          ':SK': 'MEMBER#',
        },
      }),
    );

    return members.Items?.map((item: UserMembership) => ({
      userId: item.userId,
      role: item.role,
      joinedAt: item.joinedAt,
      isOwner: item.isOwner,
      status: item.status,
    })) as UserMembership[];
  }

  async createTeam(
    owner: User,
    createTeamDto: CreateTeamDto,
  ): Promise<Team | null> {
    const res = await this.db.send(
      new GetCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Key: {
          PK: `USER#${owner.userId}`,
          SK: 'METADATA',
        },
      }),
    );

    if (!res.Item) {
      return null;
    }

    const teamId = uuidv4();
    const date = new Date().toISOString();

    await this.db.send(
      new PutCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Item: {
          PK: `TEAM#${teamId}`,
          SK: 'METADATA',
          ...createTeamDto,
          ownerId: owner.userId,
          teamId,
          createdAt: date,
        },
      }),
    );

    await this.db.send(
      new PutCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Item: {
          PK: `TEAM#${teamId}`,
          SK: `MEMBER#${owner.userId}`,
          userId: owner.userId,
          isOwner: true,
          role: 'admin',
          joinedAt: date,
          status: 'active',
        },
      }),
    );

    await this.db.send(
      new PutCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Item: {
          PK: `USER#${owner.userId}`,
          SK: `TEAM#${teamId}`,
          userId: owner.userId,
          isOwner: true,
          role: 'admin',
          joinedAt: date,
          status: 'active',
        },
      }),
    );

    return {
      teamId,
      ...createTeamDto,
      ownerId: owner.userId,
      members: [
        {
          userId: owner.userId,
          role: 'admin',
          isOwner: true,
          joinedAt: date,
          status: 'active',
        },
      ],
      createdAt: date,
    };
  }

  async updateTeam(
    owner: User,
    teamId: string,
    updateTeamDto: UpdateTeamDto,
  ): Promise<Team | null> {
    const team: Team | null = await this.getTeamById(teamId, false);

    if (!team) {
      return null;
    }

    if (team.ownerId !== owner.userId) {
      throw new Error('You are not the owner of this team');
    }

    await this.db.send(
      new PutCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Item: {
          PK: `TEAM#${teamId}`,
          SK: 'METADATA',
          ...team,
          ...updateTeamDto,
        },
      }),
    );

    return await this.getTeamData(team);
  }

  async deleteTeam(
    owner: User,
    teamId: string,
  ): Promise<{ message: string } | null> {
    const team: Team | null = await this.getTeamById(teamId);

    if (!team) {
      return null;
    }

    if (team.ownerId !== owner.userId) {
      throw new Error('You are not the owner of this team');
    }

    try {
      await this.db.send(
        new DeleteCommand({
          TableName: process.env.DYNAMO_TABLE_NAME,
          Key: {
            PK: `TEAM#${teamId}`,
            SK: 'METADATA',
          },
        }),
      );
    } catch (error) {
      console.error('Error deleting team:', error);
      throw new Error('Team deletion failed');
    }

    try {
      await this.db.send(
        new DeleteCommand({
          TableName: process.env.DYNAMO_TABLE_NAME,
          Key: {
            PK: `TEAM#${teamId}`,
            SK: `MEMBER#${owner.userId}`,
          },
        }),
      );
    } catch (error) {
      console.error('Error deleting team:', error);
      throw new Error('Team user membership deletion failed.');
    }

    try {
      await this.db.send(
        new DeleteCommand({
          TableName: process.env.DYNAMO_TABLE_NAME,
          Key: {
            PK: `USER#${owner.userId}`,
            SK: `TEAM#${teamId}`,
          },
        }),
      );
    } catch (error) {
      console.error('Error deleting team:', error);
      throw new Error('User team membership deletion failed.');
    }

    return { message: 'Team deleted successfully' };
  }

  private async getTeamData(
    team: Team | null,
    withMembers: boolean = true,
  ): Promise<Team | null> {
    if (!team) {
      return null;
    }

    return {
      teamId: team.teamId,
      name: team.name,
      description: team.description,
      ownerId: team.ownerId,
      privacy: team.privacy,
      members: withMembers ? await this.getTeamMembers(team.teamId) : [],
      createdAt: team.createdAt || new Date().toISOString(),
    };
  }

//   async inviteUsersToTeam(teamId: string, inviteUsersDto: InviteUsersDto): Promise<Team> {
//     // Implementation for inviting users to a team
//   }

//   async removeUsersFromTeam(teamId: string, removeUsersDto: RemoveUsersDto): Promise<Team> {
//     // Implementation for removing users from a team
//   }
}
