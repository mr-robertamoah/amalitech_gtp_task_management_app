import { marshall } from '@aws-sdk/util-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/users/interfaces/users.interface';
import { Comment } from './interfaces/comments.interface';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ProjectsService } from 'src/projects/projects.service';
import { TeamsService } from 'src/teams/teams.service';
import { Team, UserMembership } from 'src/teams/interfaces/teams.interface';
import { v4 as uuidv4 } from 'uuid';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { TasksService } from 'src/tasks/tasks.service';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Project } from 'src/projects/interfaces/project.interface';
import { Task } from 'src/tasks/interfaces/tasks.interface';

@Injectable()
export class CommentsService {
  constructor(
    @Inject('DYNAMO_CLIENT') private readonly db: DynamoDBDocumentClient,
    private readonly projectsService: ProjectsService,
    private readonly teamsService: TeamsService,
    private readonly tasksService: TasksService,
  ) {}

  async getProjectComments(user: User, projectId: string) {
    const project = await this.projectsService.getProjectById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    const team = await this.teamsService.getTeamById(project.teamId);

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
      new ScanCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        FilterExpression: 'begins_with(PK, :PK) AND SK = :SK',
        ExpressionAttributeValues: {
          ':PK': `COMMENT#`,
          ':SK': `PROJECT#${projectId}`,
        },
      }),
    );

    if (!res.Items || res.Items.length === 0) {
      return [];
    }

    return res.Items.map((item) => this.getCommentData(item as Comment));
  }

  async getTaskComments(user: User, taskId: string) {
    const task = await this.tasksService.getTaskById(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    const project = await this.projectsService.getProjectById(task.projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    const team = await this.teamsService.getTeamById(project.teamId);

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
      new ScanCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        FilterExpression: 'begins_with(PK, :PK) AND SK = :SK',
        ExpressionAttributeValues: {
          ':PK': `COMMENT#`,
          ':SK': `TASK#${taskId}`,
        },
      }),
    );

    if (!res.Items || res.Items.length === 0) {
      return [];
    }

    return res.Items.map((item) => this.getCommentData(item as Comment));
  }

  async getCommentById(commentId: string): Promise<Comment | null> {
    const comment = await this.db.send(
      new QueryCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        KeyConditionExpression: 'PK = :PK',
        ExpressionAttributeValues: {
          ':PK': `COMMENT#${commentId}`,
        },
      }),
    );

    if (!comment.Items || comment.Items.length === 0) {
      return null;
    }

    return this.getCommentData(comment.Items[0] as Comment);
  }

  async createComment(user: User, dto: CreateCommentDto) {
    let comment: Comment | null = null;

    if (!dto.taskId && !dto.projectId) {
      throw new Error(
        'You must specify the task or project on which you want to comment',
      );
    }

    if (dto.taskId) comment = await this.createTaskComment(user, dto);
    if (dto.projectId && !dto.taskId)
      comment = await this.createProjectComment(user, dto);

    return this.getCommentData(comment);
  }

  async createTaskComment(
    user: User,
    dto: CreateCommentDto,
  ): Promise<Comment | null> {
    if (!dto.taskId) {
      return null;
    }

    const task = await this.tasksService.getTaskById(dto.taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    if (!dto.projectId) {
      return null;
    }

    const project = await this.projectsService.getProjectById(dto.projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    const team = await this.teamsService.getTeamById(project.teamId);

    if (!team) {
      throw new Error('Team not found');
    }

    const teamMembership: UserMembership | null =
      await this.teamsService.getTeamMembership(team.teamId, user.userId);

    if (
      !teamMembership ||
      !teamMembership.isOwner ||
      teamMembership.status !== 'active' ||
      teamMembership?.userId !== task.creator.userId ||
      (task.assignee?.userId &&
        teamMembership?.userId !== task.assignee?.userId)
    ) {
      throw new Error('You are not allowed to comment on this task');
    }

    const commentId = uuidv4();
    const date = new Date().toISOString();

    const comment: Comment = {
      content: dto.content,
      commentId,
      taskId: dto.taskId,
      projectId: dto.projectId,
      teamId: dto.teamId,
      createdAt: date,
      updatedAt: date,
      creator: this.teamsService.getUserSafeData(user),
    };

    const mashallOptions = {
      removeUndefinedValues: true,
    };

    const marshalledTask = marshall(comment, mashallOptions);

    await this.createCommentWithData(
      commentId,
      'task',
      dto.taskId,
      marshalledTask,
    );

    // TODO notify team owner if not creator of comment
    // TODO notify assignee if not creator of comment
    // TODO notify task creator if not creator of comment

    return this.getCommentData(comment);
  }

  async createProjectComment(
    user: User,
    dto: CreateCommentDto,
  ): Promise<Comment | null> {
    if (!dto.projectId) {
      return null;
    }

    const project = await this.projectsService.getProjectById(dto.projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    const team = await this.teamsService.getTeamById(project.teamId);

    if (!team) {
      throw new Error('Team not found');
    }

    const teamMembership: UserMembership | null =
      await this.teamsService.getTeamMembership(team.teamId, user.userId);

    if (!teamMembership && team.privacy !== 'public') {
      throw new Error('You are not allowed to comment on this project');
    }

    const commentId = uuidv4();
    const date = new Date().toISOString();

    const comment: Comment = {
      content: dto.content,
      commentId,
      projectId: dto.projectId,
      teamId: dto.teamId,
      createdAt: date,
      updatedAt: date,
      creator: this.teamsService.getUserSafeData(user),
    };

    const mashallOptions = {
      removeUndefinedValues: true,
    };

    const marshalledTask = marshall(comment, mashallOptions);

    await this.createCommentWithData(
      commentId,
      'project',
      dto.projectId,
      marshalledTask,
    );

    // TODO notify team members

    return this.getCommentData(comment);
  }

  private getCommentData(comment): Comment | null {
    if (!comment) {
      return null;
    }

    if (!comment.commentId?.S)
      return {
        commentId: comment.commentId,
        content: comment.content,
        creator: this.teamsService.getUserSafeData(comment.creator as User),
        projectId: comment.projectId,
        taskId: comment.taskId,
        teamId: comment.teamId,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      };

    return {
      commentId: comment.commentId?.S,
      content: comment.content?.S,
      taskId: comment.taskId?.S,
      projectId: comment.projectId?.S,
      teamId: comment.teamId?.S,
      creator: this.teamsService.transformObject(comment.creator?.M),
      createdAt: comment.createdAt?.S,
      updatedAt: comment.updatedAt?.S,
    } as Comment;
  }

  private async createCommentWithData(
    commentId: string,
    item: string,
    itemId: string,
    data: Record<string, AttributeValue>,
  ) {
    await this.db.send(
      new PutCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Item: {
          ...data,
          PK: `COMMENT#${commentId}`,
          SK: `${item.toUpperCase()}#${itemId}`,
        },
      }),
    );
  }

  async updateComment(
    user: User,
    commentId: string,
    dto: UpdateCommentDto,
  ): Promise<Comment | null> {
    const comment = await this.getCommentById(commentId);

    if (!comment) {
      return null;
    }

    if (comment.creator.userId !== user.userId) {
      throw new Error('You are not allowed to update this comment');
    }

    if (comment.taskId) {
      const task = await this.tasksService.getTaskById(comment.taskId);

      if (!task) {
        throw new Error('Associated task not found');
      }

      if (this.tasksService.hasTaskEnded(task)) {
        throw new Error('Task has ended');
      }
    }

    if (comment.projectId) {
      const project = await this.projectsService.getProjectById(
        comment.projectId,
      );

      if (!project) {
        throw new Error('Associated project not found');
      }

      if (this.projectsService.hasProjectEnded(project)) {
        throw new Error('Project has ended');
      }
    }

    let hasUpdate: boolean = false;

    // Add updateTaskDto fields to project if they exist and are not the same as that of the oldTask
    if (dto.content && dto.content !== comment.content) {
      comment.content = dto.content;
      hasUpdate = true;
    }

    if (!hasUpdate) {
      throw new Error('No fields to update');
    }

    comment.updatedAt = new Date().toISOString();

    await this.db.send(
      new PutCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Item: {
          PK: `COMMENT#${commentId}`,
          SK: comment.taskId
            ? `TASK#${comment.taskId}`
            : `PROJECT#${comment.projectId}`,
          ...comment,
        },
      }),
    );

    // TODO if not updated by team owner, notify owner
    // TODO if not updated by project or task creator, notify creator
    // TODO if not updated by assignee for a task, notify assignee

    return this.getCommentData(comment);
  }

  async deleteComment(
    user: User,
    commentId: string,
  ): Promise<{ message: string } | null> {
    const comment = await this.getCommentById(commentId);
    let project: Project | null = null;
    let task: Task | null = null;
    let team: Team | null = null;

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.taskId) {
      task = await this.tasksService.getTaskById(comment.taskId);

      if (!task) {
        throw new Error('Associated task not found');
      }

      if (this.tasksService.hasTaskEnded(task)) {
        throw new Error('Task has ended');
      }
    }

    if (comment.projectId) {
      project = await this.projectsService.getProjectById(comment.projectId);

      if (!project) {
        throw new Error('Associated project not found');
      }

      if (this.projectsService.hasProjectEnded(project)) {
        throw new Error('Project has ended');
      }
    }

    if (comment.teamId) {
      team = await this.teamsService.getTeamById(comment.teamId);

      if (!team) {
        throw new Error('Associated team not found');
      }
    }

    if (
      comment.creator.userId !== user.userId ||
      (task && task.creator?.userId !== user.userId) ||
      (project && project.creator?.userId !== user.userId) ||
      (team && team.ownerId !== user.userId)
    ) {
      throw new Error('You are not allowed to delete this comment');
    }

    await this.db.send(
      new DeleteCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Key: {
          PK: `COMMENT#${commentId}`,
          SK: comment.taskId
            ? `TASK#${comment.taskId}`
            : `PROJECT#${comment.projectId}`,
        },
      }),
    );

    // TODO if not deleted by comment, notify creator

    return { message: 'Comment deleted successfully' };
  }
}
