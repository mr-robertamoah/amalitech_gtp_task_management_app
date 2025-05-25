import { marshall } from '@aws-sdk/util-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { Project } from './interfaces/project.interface';
import { TeamsService } from 'src/teams/teams.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { v4 as uuidv4 } from 'uuid';
import { UserMembership } from 'src/teams/interfaces/teams.interface';
import { User } from 'src/users/interfaces/users.interface';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject('DYNAMO_CLIENT') private readonly db: DynamoDBDocumentClient,
    private readonly teamsService: TeamsService,
  ) {}

  async getProject(user: User, projectId: string) {
    const project = await this.getProjectById(projectId);

    if (!project) return null;

    const team = await this.teamsService.getTeamById(project.teamId);

    if (!team) {
      throw new Error('Team for the project not found');
    }

    const isMember = team.members.some(
      (member) => member.userId === user.userId,
    );

    if (!isMember && team.privacy === 'private') {
      throw new Error('You are not a member of this team');
    }

    return {
      ...project,
      teamOwnerId: team.ownerId,
      isAdmin: team.members.some(
        (member) => member.userId === user.userId && member.role === 'admin',
      ),
      // TODO tasks and their comments
    };
  }

  async getPublicProject(projectId: string) {
    const project = await this.getProjectById(projectId);

    if (!project) return null;

    const team = await this.teamsService.getTeamById(project.teamId);

    if (!team || team.privacy === 'private') {
      throw new Error('Team for the project not found or is private');
    }

    return {
      ...project,
      teamOwnerId: team.ownerId,
      isAdmin: false,
      // TODO tasks and their comments
    };
  }

  async getProjectById(projectId: string) {
    const res = await this.db.send(
      new QueryCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        KeyConditionExpression: 'PK = :PK',
        ExpressionAttributeValues: {
          ':PK': `PROJECT#${projectId}`,
        },
      }),
    );

    if (!res.Items || res.Items.length === 0) {
      return null;
    }

    const project = res.Items[0];

    return this.teamsService.getProjectData(project as Project);
  }

  async getTeamProjects(user: User, teamId: string) {
    const team = await this.teamsService.getTeamById(teamId);

    if (!team) {
      throw new Error('Team not found');
    }

    const isMember = team.members.some(
      (member) => member.userId === user.userId,
    );

    if (!isMember && team.privacy === 'private') {
      return [];
    }

    const res = await this.db.send(
      new QueryCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        KeyConditionExpression: 'PK = :PK AND SK = :SK)',
        ExpressionAttributeValues: {
          ':PK': `PROJECT#${teamId}`,
          ':SK': `TEAM#${teamId}`,
        },
      }),
    );

    if (!res.Items || res.Items.length === 0) {
      return [];
    }

    return (res.Items as Project[])
      .map((item) => {
        return this.teamsService.getProjectData(item as Project | null);
      })
      .filter((project) => !!project);
  }

  async createProject(
    owner: User,
    createProjectDto: CreateProjectDto,
  ): Promise<Project | null> {
    const teamMembership: UserMembership | null =
      await this.teamsService.getTeamMembership(
        createProjectDto.teamId,
        owner.userId,
      );

    if (
      !teamMembership ||
      teamMembership.status !== 'active' ||
      !teamMembership.isOwner ||
      teamMembership.role !== 'admin'
    ) {
      throw new Error('You cannot create a project for this team.');
    }

    const projectId = uuidv4();
    const date = new Date().toISOString();

    const project: Project = {
      projectId,
      name: createProjectDto.name,
      description: createProjectDto.description,
      creator: this.teamsService.getUserSafeData(owner),
      teamId: createProjectDto.teamId,
      createdAt: date,
      updatedAt: date,
    };

    const mashallOptions = {
      removeUndefinedValues: true,
    };

    const marshalledProject = marshall(project, mashallOptions);

    try {
      await this.db.send(
        new PutCommand({
          TableName: process.env.DYNAMO_TABLE_NAME,
          Item: {
            PK: `PROJECT#${projectId}`,
            SK: `TEAM#${createProjectDto.teamId}`,
            ...marshalledProject,
          },
        }),
      );
    } catch (error) {
      throw new Error('Failed to create project');
    }

    // TODO if not created by team owner, notify owner

    return this.teamsService.getProjectData(project);
  }

  async updateProject(
    owner: User,
    projectId: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project | null> {
    const teamMembership: UserMembership | null =
      await this.teamsService.getTeamMembership(
        updateProjectDto.teamId,
        owner.userId,
      );

    if (
      !teamMembership ||
      teamMembership.status !== 'active' ||
      !teamMembership.isOwner ||
      teamMembership.role !== 'admin'
    ) {
      throw new Error('You cannot update project for this team.');
    }

    const oldProject: Project | null = await this.getProjectById(projectId);

    if (!oldProject) {
      return null;
    }

    if (this.hasProjectEnded(oldProject)) {
      throw new Error('Project has ended');
    }

    if (owner.userId !== oldProject.creator.userId || !teamMembership.isOwner) {
      throw new Error(
        'You are not the creator of this project nor the owner of the team.',
      );
    }

    let project: Project | null = { ...oldProject };
    let hasUpdate: boolean = false;

    // Add updateProjectDto fields to project if they exist and are not the same as that of the oldProject
    if (updateProjectDto.name && updateProjectDto.name !== oldProject.name) {
      project.name = updateProjectDto.name;
      hasUpdate = true;
    }
    if (
      updateProjectDto.description &&
      updateProjectDto.description !== oldProject.description
    ) {
      project.description = updateProjectDto.description;
      hasUpdate = true;
    }
    if (
      updateProjectDto.startAt &&
      updateProjectDto.startAt !== oldProject.startAt
    ) {
      project.startAt = updateProjectDto.startAt;
      hasUpdate = true;
    }
    if (updateProjectDto.endAt && updateProjectDto.endAt !== oldProject.endAt) {
      project.endAt = updateProjectDto.endAt;
      hasUpdate = true;
    }

    this.validateDates(project.startAt, project.endAt);

    if (!hasUpdate) {
      throw new Error('No fields to update');
    }

    project.updatedAt = new Date().toISOString();

    await this.db.send(
      new PutCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Item: {
          PK: `PROJECT#${projectId}`,
          SK: `TEAM#${updateProjectDto.teamId}`,
          ...project,
        },
      }),
    );

    // TODO if not updated by team owner, notify owner
    // TODO if not updated by creator, notify creator

    project = this.teamsService.getProjectData(project);

    return project;
  }

  async deleteProject(
    owner: User,
    projectId: string,
  ): Promise<{ message: string } | null> {
    const project = await this.getProjectById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    if (this.hasProjectEnded(project)) {
      throw new Error('Project has ended');
    }

    const teamMembership: UserMembership | null =
      await this.teamsService.getTeamMembership(project.teamId, owner.userId);

    if (
      !teamMembership ||
      teamMembership.status !== 'active' ||
      !teamMembership.isOwner ||
      teamMembership.userId !== project.creator.userId
    ) {
      throw new Error('You cannot delete this project.');
    }

    await this.db.send(
      new DeleteCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Key: {
          PK: `PROJECT#${projectId}`,
          SK: `TEAM#${project.teamId}`,
        },
      }),
    );

    // TODO delete associated tasks and comments

    // TODO if not deleted by team owner, notify owner
    // TODO if not deleted by creator, notify creator

    return { message: 'Project deleted successfully' };
  }

  // TODO create a private method which will do extra validation on the dates
  // it will ensure that updating the startat does not go beyond the earliest task
  // endat is not before the endat of any task
  // the method will be used in the updateProject method

  validateDates(startAt: string | undefined, endAt: string | undefined) {
    if (startAt && endAt) {
      const startDate = new Date(startAt);
      const endDate = new Date(endAt);

      if (startDate > endDate) {
        throw new Error('Start date cannot be after end date');
      }

      // Dates should be at least 1 day apart
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 1) {
        throw new Error('Dates should be at least 1 day apart');
      }

      // Dates can be today or in the future
      // currentDate is the current date without time
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Set to the start of the day

      if (startDate < currentDate || endDate < currentDate) {
        throw new Error('Dates cannot be in the past');
      }

      return;
    }

    if (!startAt && !endAt) {
      return;
    }

    throw new Error(
      'You cannot set one date (startAt or endAt) without the other',
    );
  }

  hasProjectEnded(project: Project): boolean {
    if (!project.endAt) {
      return false;
    }

    const endDate = new Date(project.endAt);
    const currentDate = new Date();

    return endDate < currentDate;
  }

  isProjectInProgress(project: Project): boolean {
    if (!project.startAt || !project.endAt) {
      return false;
    }

    const startDate = new Date(project.startAt);
    const endDate = new Date(project.endAt);
    const currentDate = new Date();

    return startDate <= currentDate && currentDate <= endDate;
  }

  isProjectUpcoming(project: Project): boolean {
    if (!project.startAt) {
      return false;
    }

    const startDate = new Date(project.startAt);
    const currentDate = new Date();

    return startDate > currentDate;
  }

  isProjectOverdue(project: Project): boolean {
    if (!project.endAt) {
      return false;
    }

    const endDate = new Date(project.endAt);
    const currentDate = new Date();

    return endDate < currentDate;
  }

  isProjectActive(project: Project): boolean {
    return (
      this.isProjectInProgress(project) ||
      this.isProjectUpcoming(project) ||
      !this.hasProjectEnded(project)
    );
  }
}
