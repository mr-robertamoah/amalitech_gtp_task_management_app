import { User, UserSafe } from 'src/users/interfaces/users.interface';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { Team, UserMembership } from './interfaces/teams.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InviteUsersDto } from './dto/invite-users.dto';
import { UsersService } from 'src/users/users.service';
import { RemoveUsersDto } from './dto/remove-users.dto';
import { RespondToInvitationDto } from './dto/respond-to-invitation.dto';
import { Project } from 'src/projects/interfaces/project.interface';
import { BatchGetItemCommand } from '@aws-sdk/client-dynamodb';

@Injectable()
export class TeamsService {
  constructor(
    @Inject('DYNAMO_CLIENT') private readonly db: DynamoDBDocumentClient,
    private readonly userService: UsersService,
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

  async getMembers(
    user: User | null,
    teamId: string,
  ): Promise<UserMembership[]> {
    const team = await this.getTeamById(teamId);

    if (!team) {
      return [];
    }

    if (team.privacy == 'private') {
      const teamMembership: UserMembership | null =
        await this.getTeamMembership(teamId, user?.userId || null);

      if (!teamMembership) {
        return [];
      }
    }

    return await this.getTeamMembers(teamId);
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

  async getTeam(user: User, teamId: string): Promise<Team | null> {
    const team = await this.getTeamById(teamId);

    if (!team) {
      return null;
    }

    const teamMembership: UserMembership | null = await this.getTeamMembership(
      teamId,
      user.userId,
    );

    if (team.privacy == 'private' && !teamMembership) {
      return null;
    }

    return await this.getTeamData(team);
  }

  async getTeams(user: User) {
    const res = await this.db.send(
      new QueryCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        KeyConditionExpression: 'PK = :PK AND begins_with(SK, :SK)',
        ExpressionAttributeValues: {
          ':PK': `USER#${user.userId}`,
          ':SK': 'TEAM#',
        },
      }),
    );

    if (!res.Items || res.Items.length === 0) {
      return [];
    }

    const teamIds = res.Items.map((item) => {
      if (item.SK?.startsWith('TEAM#')) {
        return item.SK.split('#')[1];
      }

      return null;
    }).filter((item) => !!item);

    console.log(res.Items, teamIds);

    if (teamIds.length === 0) {
      return [];
    }

    const batchGetItemRes = await this.db.send(
      new BatchGetItemCommand({
        RequestItems: {
          [process.env.DYNAMO_TABLE_NAME || '']: {
            Keys: teamIds.map((teamId) => ({
              PK: { S: `TEAM#${teamId}` },
              SK: { S: `METADATA` },
            })),
          },
        },
      }),
    );

    console.log(batchGetItemRes);

    if (!batchGetItemRes.Responses) {
      return [];
    }

    const teams = batchGetItemRes.Responses[
      process.env.DYNAMO_TABLE_NAME || ''
    ].map((item) => {
      console.log(item);
      if (!item.SK?.S) {
        return null;
      }
      return {
        teamId: item.PK?.S?.split('#')[1],
        name: item.name?.S,
        ownerId: item.ownerId?.S,
        description: item.description?.S,
        createdAt: item.createdAt?.S,
      } as Team;
    });

    return teams;
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
      details: item?.details,
    })) as UserMembership[];
  }

  async getTeamMembership(
    teamId: string,
    userId: string | null,
  ): Promise<UserMembership | null> {
    if (!userId) {
      return null;
    }
    const res = await this.db.send(
      new GetCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Key: {
          PK: `TEAM#${teamId}`,
          SK: `MEMBER#${userId}`,
        },
      }),
    );

    if (!res.Item) {
      return null;
    }

    const item = res.Item as UserMembership;

    return {
      userId: item.userId,
      role: item.role,
      joinedAt: item.joinedAt,
      isOwner: item.isOwner,
      status: item.status,
    };
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
          details: this.getUserSafeData(owner),
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
          details: {
            ...createTeamDto,
            teamId,
          },
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

    // TODO update only fields that are provided and are different from existing data

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

    // TODO notify other members apart from owner

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

    // TODO notify other members apart from owner

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

  async inviteUsersToTeam(
    owner: User,
    teamId: string,
    inviteUsersDto: InviteUsersDto,
  ): Promise<Team | null> {
    const team: Team | null = await this.getTeamById(teamId);

    if (!team) {
      return null;
    }

    if (team.ownerId !== owner.userId) {
      throw new Error('You are not the owner of this team');
    }

    const notifiableUsers: User[] = [];

    for (const userId of inviteUsersDto.userIds) {
      const user: User | null = await this.userService.getUserById(userId);

      if (!user || user.userId == owner.userId) {
        continue;
      }

      notifiableUsers.push(user);

      await this.db.send(
        new PutCommand({
          TableName: process.env.DYNAMO_TABLE_NAME,
          Item: {
            PK: `TEAM#${teamId}`,
            SK: `MEMBER#${userId}`,
            userId,
            isOwner: false,
            role: 'member',
            status: 'invited',
            details: this.getUserSafeData(user),
          },
        }),
      );

      await this.db.send(
        new PutCommand({
          TableName: process.env.DYNAMO_TABLE_NAME,
          Item: {
            PK: `USER#${userId}`,
            SK: `TEAM#${teamId}`,
            userId,
            isOwner: false,
            role: 'member',
            status: 'invited',
            details: this.getTeamSafeData(team),
          },
        }),
      );
    }

    // TODO Notify users about the invitation
    // for (const user of notifiableUsers) {
    //   await this.notificationService.sendNotification(
    //     user.userId,
    //     `You have been invited to join team ${team.name}`,
    //   );
    // }

    return await this.getTeamData(team);
  }

  async removeUsersFromTeam(
    owner: User,
    teamId: string,
    removeUsersDto: RemoveUsersDto,
  ): Promise<Team | null> {
    const team: Team | null = await this.getTeamById(teamId);

    if (!team) {
      return null;
    }

    if (team.ownerId !== owner.userId) {
      throw new Error('You are not the owner of this team');
    }

    const notifiableUsers: User[] = [];

    for (const userId of removeUsersDto.userIds) {
      const user: User | null = await this.userService.getUserById(userId);

      if (!user || user.userId == owner.userId) {
        continue;
      }

      notifiableUsers.push(user);

      await this.db.send(
        new DeleteCommand({
          TableName: process.env.DYNAMO_TABLE_NAME,
          Key: {
            PK: `TEAM#${teamId}`,
            SK: `MEMBER#${userId}`,
          },
        }),
      );

      await this.db.send(
        new DeleteCommand({
          TableName: process.env.DYNAMO_TABLE_NAME,
          Key: {
            PK: `USER#${userId}`,
            SK: `TEAM#${teamId}`,
          },
        }),
      );
    }

    // TODO Notify users about the invitation
    // for (const user of notifiableUsers) {
    //   await this.notificationService.sendNotification(
    //     user.userId,
    //     `You have been invited to join team ${team.name}`,
    //   );
    // }

    return await this.getTeamData(team);
  }

  async banUsers(
    owner: User,
    teamId: string,
    dto: InviteUsersDto,
  ): Promise<Team | null> {
    const team: Team | null = await this.getTeamById(teamId);

    if (!team) {
      return null;
    }

    if (team.ownerId !== owner.userId) {
      throw new Error('You are not the owner of this team');
    }

    const notifiableUsers: User[] = [];

    for (const userId of dto.userIds) {
      const userMembership: UserMembership | null =
        await this.getTeamMembership(teamId, userId);
      const user: User | null = await this.userService.getUserById(userId);

      if (
        !user ||
        !userMembership ||
        user.userId == owner.userId ||
        userMembership.status !== 'active'
      ) {
        continue;
      }

      notifiableUsers.push(user);

      await this.updateUserStatus(user.userId, teamId, 'banned');
    }

    // TODO Notify users about the invitation
    // for (const user of notifiableUsers) {
    //   await this.notificationService.sendNotification(
    //     user.userId,
    //     `You have been invited to join team ${team.name}`,
    //   );
    // }

    return await this.getTeamData(team);
  }

  async activateUsers(
    owner: User,
    teamId: string,
    dto: InviteUsersDto,
  ): Promise<Team | null> {
    const team: Team | null = await this.getTeamById(teamId);

    if (!team) {
      return null;
    }

    if (team.ownerId !== owner.userId) {
      throw new Error('You are not the owner of this team');
    }

    const notifiableUsers: User[] = [];

    for (const userId of dto.userIds) {
      const userMembership: UserMembership | null =
        await this.getTeamMembership(teamId, userId);
      const user: User | null = await this.userService.getUserById(userId);

      if (
        !user ||
        !userMembership ||
        user.userId == owner.userId ||
        userMembership.status !== 'banned'
      ) {
        continue;
      }

      notifiableUsers.push(user);

      await this.updateUserStatus(user.userId, teamId, 'active');
    }

    // TODO Notify users about the invitation
    // for (const user of notifiableUsers) {
    //   await this.notificationService.sendNotification(
    //     user.userId,
    //     `You have been invited to join team ${team.name}`,
    //   );
    // }

    return await this.getTeamData(team);
  }

  async makeAdmins(
    owner: User,
    teamId: string,
    dto: InviteUsersDto,
  ): Promise<Team | null> {
    const team: Team | null = await this.getTeamById(teamId);

    if (!team) {
      return null;
    }

    if (team.ownerId !== owner.userId) {
      throw new Error('You are not the owner of this team');
    }

    const notifiableUsers: User[] = [];

    for (const userId of dto.userIds) {
      const userMembership: UserMembership | null =
        await this.getTeamMembership(teamId, userId);
      const user: User | null = await this.userService.getUserById(userId);

      if (
        !user ||
        !userMembership ||
        user.userId == owner.userId ||
        userMembership.role !== 'member' ||
        userMembership.status !== 'active'
      ) {
        continue;
      }

      notifiableUsers.push(user);

      await this.updateUserRole(user.userId, teamId, 'admin');
    }

    // TODO Notify users about the invitation
    // for (const user of notifiableUsers) {
    //   await this.notificationService.sendNotification(
    //     user.userId,
    //     `You have been invited to join team ${team.name}`,
    //   );
    // }

    return await this.getTeamData(team);
  }

  getUserSafeData(user: User): UserSafe {
    return {
      userId: user.userId,
      username: user.username,
      email: user.email,
    };
  }

  private getTeamSafeData(team: Team) {
    return {
      teamId: team.teamId,
      name: team.name,
      description: team.description,
      createdAt: team.createdAt,
    };
  }

  async makeMembers(
    owner: User,
    teamId: string,
    dto: InviteUsersDto,
  ): Promise<Team | null> {
    const team: Team | null = await this.getTeamById(teamId);

    if (!team) {
      return null;
    }

    if (team.ownerId !== owner.userId) {
      throw new Error('You are not the owner of this team');
    }

    const notifiableUsers: User[] = [];

    for (const userId of dto.userIds) {
      const userMembership: UserMembership | null =
        await this.getTeamMembership(teamId, userId);
      const user: User | null = await this.userService.getUserById(userId);

      if (
        !user ||
        !userMembership ||
        user.userId == owner.userId ||
        userMembership.role !== 'admin' ||
        userMembership.status !== 'active'
      ) {
        continue;
      }

      notifiableUsers.push(user);

      await this.updateUserRole(user.userId, teamId, 'member');
    }

    // TODO Notify users about the invitation
    // for (const user of notifiableUsers) {
    //   await this.notificationService.sendNotification(
    //     user.userId,
    //     `You have been invited to join team ${team.name}`,
    //   );
    // }

    return await this.getTeamData(team);
  }

  private async updateUserStatus(
    userId: string,
    teamId: string,
    status: 'active' | 'banned',
  ): Promise<void> {
    await this.db.send(
      new UpdateCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Key: {
          PK: `TEAM#${teamId}`,
          SK: `MEMBER#${userId}`,
        },
        UpdateExpression: 'SET #status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': `${status}`,
        },
      }),
    );

    await this.db.send(
      new UpdateCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `TEAM#${teamId}`,
        },
        UpdateExpression: 'SET #status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': `${status}`,
        },
      }),
    );
  }

  private async updateUserRole(
    userId: string,
    teamId: string,
    role: 'admin' | 'member',
  ): Promise<void> {
    await this.db.send(
      new UpdateCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Key: {
          PK: `TEAM#${teamId}`,
          SK: `MEMBER#${userId}`,
        },
        UpdateExpression: 'SET #role = :role',
        ExpressionAttributeNames: {
          '#role': 'role',
        },
        ExpressionAttributeValues: {
          ':role': `${role}`,
        },
      }),
    );

    await this.db.send(
      new UpdateCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `TEAM#${teamId}`,
        },
        UpdateExpression: 'SET #role = :role',
        ExpressionAttributeNames: {
          '#role': 'role',
        },
        ExpressionAttributeValues: {
          ':role': `${role}`,
        },
      }),
    );
  }

  async respondToTeamInvitation(
    user: User,
    teamId: string,
    dto: RespondToInvitationDto,
  ): Promise<Team | null> {
    const team: Team | null = await this.getTeamById(teamId);

    if (!team) {
      return null;
    }

    const userMembership: UserMembership | null = await this.getTeamMembership(
      teamId,
      user.userId,
    );

    if (!userMembership) {
      return null;
    }

    if (
      userMembership.status !== 'invited' ||
      userMembership.userId !== user.userId
    ) {
      throw new Error('You are not invited to this team');
    }

    if (dto.response === 'accept') {
      await this.updateUserStatus(user.userId, teamId, 'active');

      // TODO Notify owner about user accepting the invitation
      // await this.notificationService.sendNotification(
      //   team.ownerId,
      //   `${user.username} has accepted the invitation to join the team ${team.name}`,
      // );
      return await this.getTeamData(team);
    }
    await this.deleteTeamMembership(teamId, user.userId);

    // TODO Notify owner about user declining the invitation
    // await this.notificationService.sendNotification(
    //   team.ownerId,
    //   `${user.username} has declined the invitation to join the team ${team.name}`,
    // );

    if (team.privacy === 'private') return null;

    return await this.getTeamData(team);
  }

  async leaveTeam(user: User, teamId: string): Promise<Team | null> {
    const team: Team | null = await this.getTeamById(teamId);

    if (!team) {
      return null;
    }

    const userMembership: UserMembership | null = await this.getTeamMembership(
      teamId,
      user.userId,
    );

    if (!userMembership) {
      return null;
    }

    if (userMembership.userId !== user.userId) {
      throw new Error('You are not a member of this team');
    }

    if (userMembership.isOwner) {
      throw new Error('You cannot leave a team you own');
    }

    if (userMembership.status == 'invited') {
      throw new Error(
        'You only have an invitation to this team. You are not yet a member.',
      );
    }

    await this.deleteTeamMembership(teamId, user.userId);

    // TODO Notify owner about user leaving the team
    // await this.notificationService.sendNotification(
    //   team.ownerId,
    //   `${user.username} has left the team ${team.name}`,
    // );
    if (team.privacy === 'private') return null;

    return await this.getTeamData(team);
  }

  private async deleteTeamMembership(
    teamId: string,
    userId: string,
  ): Promise<void> {
    await this.db.send(
      new DeleteCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Key: {
          PK: `TEAM#${teamId}`,
          SK: `MEMBER#${userId}`,
        },
      }),
    );

    await this.db.send(
      new DeleteCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `TEAM#${teamId}`,
        },
      }),
    );
  }

  async getProjects(user: User | null, teamId: string): Promise<Project[]> {
    const team = await this.getTeamById(teamId);

    if (!team) {
      throw new Error('Team not found');
    }

    const isMember = team.members.some(
      (member) => member.userId === user?.userId,
    );

    if (!isMember && team.privacy === 'private') {
      return [];
    }

    const res = await this.db.send(
      new ScanCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        FilterExpression: 'begins_with(PK, :PK) AND SK = :SK',
        ExpressionAttributeValues: {
          ':PK': `PROJECT#`,
          ':SK': `TEAM#${teamId}`,
        },
      }),
    );

    if (!res.Items || res.Items.length === 0) {
      return [];
    }

    return (res.Items as Project[])
      .map((item) => {
        return this.getProjectData(item);
      })
      .filter((project) => !!project);
  }

  async getPublicTeams() {
    const res = await this.db.send(
      new ScanCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        FilterExpression:
          'begins_with(PK, :PK) AND SK = :SK AND privacy = :val1',
        ExpressionAttributeValues: {
          ':PK': 'TEAM#',
          ':SK': 'METADATA',
          ':val1': 'public',
        },
      }),
    );

    if (!res.Items || res.Items.length === 0) {
      return [];
    }

    const teams = await Promise.all(
      (res.Items as Team[]).map(async (item) => {
        return await this.getTeamData(item);
      }),
    );

    return teams.filter((item) => !!item);
  }

  getProjectData(project): Project | null {
    if (!project) {
      return null;
    }

    if (!project.projectId?.S)
      return {
        projectId: project.projectId,
        name: project.name,
        description: project.description,
        creator: project.creator,
        teamId: project.teamId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      };

    return {
      projectId: project.projectId?.S,
      name: project.name?.S,
      description: project.description?.S,
      creator: this.transformObject(project.creator?.M),
      teamId: project.teamId?.S,
      createdAt: project.createdAt?.S,
      updatedAt: project.updatedAt?.S,
    } as Project;
  }

  private transformObject(obj) {
    const transformedObj = {};
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (obj[key].S) {
          transformedObj[key] = obj[key].S;
        } else {
          transformedObj[key] = this.transformObject(obj[key]);
        }
      } else {
        transformedObj[key] = obj[key];
      }
    }
    return transformedObj;
  }
}
