import { marshall } from '@aws-sdk/util-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { User, UserSafe } from 'src/users/interfaces/users.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { TeamsService } from 'src/teams/teams.service';
import { ProjectsService } from 'src/projects/projects.service';
import { UserMembership } from 'src/teams/interfaces/teams.interface';
import { v4 as uuidv4 } from 'uuid';
import { Task } from './interfaces/tasks.interface';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ChangeTaskStatusDto } from './dto/change-task-status.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TasksService {
  constructor(
    @Inject('DYNAMO_CLIENT') private readonly db: DynamoDBDocumentClient,
    private readonly teamsService: TeamsService,
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
  ) {}

  async assignTaskToMember(user: User, taskId: string, dto: AssignTaskDto) {
    const assignee = await this.usersService.getUserById(dto.assigneeId);

    if (!assignee) {
      throw new Error('Assignee not found');
    }

    const task = await this.getTaskById(taskId);

    if (!task) {
      return null;
    }

    const project = await this.projectsService.getProjectById(task.projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    if (this.projectsService.hasProjectEnded(project)) {
      throw new Error('Project has ended');
    }

    const team = await this.teamsService.getTeamById(project.teamId);

    if (!team) {
      throw new Error('Team not found');
    }

    const teamMembership: UserMembership | null =
      await this.teamsService.getTeamMembership(team.teamId, user.userId);

    if (!teamMembership || teamMembership.status !== 'active') {
      throw new Error('You are not an active member of this team');
    }

    const assigneeMembership: UserMembership | null =
      await this.teamsService.getTeamMembership(team.teamId, assignee.userId);

    if (!assigneeMembership || assigneeMembership.status !== 'active') {
      throw new Error('Assignee is not an active member of this team');
    }

    let canAssignTask: boolean = false;

    // Can assign a task to any member if you are team owner or project owner or task creator
    if (
      teamMembership?.isOwner ||
      teamMembership?.userId === task.creator.userId ||
      teamMembership?.userId === project.creator.userId
    ) {
      canAssignTask = true;
    }

    // Can assign task to users with member roles if you are team admin
    if (
      teamMembership?.role === 'admin' &&
      assigneeMembership?.role === 'member'
    ) {
      canAssignTask = true;
    }

    // Can assign a task to yourself if you a team admin
    if (
      teamMembership?.role === 'admin' &&
      teamMembership?.userId === assignee.userId
    ) {
      canAssignTask = true;
    }

    if (!canAssignTask) {
      throw new Error(
        "You are not allowed to assign a task for this team's project",
      );
    }

    task.assignee = this.teamsService.removeKeysWithUndefinedValue(
      this.teamsService.getUserSafeData(assignee),
    ) as UserSafe;
    task.assigneeId = assignee.userId;
    task.updatedAt = new Date().toISOString();
    task.status = 'pending';
    task.assigner = this.teamsService.removeKeysWithUndefinedValue(
      this.teamsService.getUserSafeData(user),
    ) as UserSafe;
    task.assignerId = user.userId;
    // delete task.startAt;
    // delete task.endAt;

    await this.db.send(
      new PutCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Item: {
          PK: `TASK#${taskId}`,
          SK: `PROJECT#${task.projectId}`,
          ...task,
        },
      }),
    );

    // TODO notify assignee
    // TODO notify team owner if not changed by them
    // TODO notify task creator if not changed by them
    // TODO notify project owner if not changed by them

    return this.getTaskData(task);
  }

  async removeAssigneeFromTask(user: User, taskId: string) {
    const task = await this.getTaskById(taskId);

    if (!task) {
      return null;
    }

    const project = await this.projectsService.getProjectById(task.projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    if (this.projectsService.hasProjectEnded(project)) {
      throw new Error('Project has ended');
    }

    const team = await this.teamsService.getTeamById(project.teamId);

    if (!team) {
      throw new Error('Team not found');
    }

    const teamMembership: UserMembership | null =
      await this.teamsService.getTeamMembership(team.teamId, user.userId);

    if (!teamMembership || teamMembership.status !== 'active') {
      throw new Error('You are not an active member of this team');
    }

    const assigneeMembership: UserMembership | null =
      await this.teamsService.getTeamMembership(
        team.teamId,
        task.assignee?.userId ?? null,
      );

    let canUnassignTask: boolean = false;

    // Can unassign a task from any member if you are team owner or project owner or task creator
    if (
      teamMembership?.isOwner ||
      teamMembership?.userId === task.creator.userId ||
      teamMembership?.userId === project.creator.userId
    ) {
      canUnassignTask = true;
    }

    // Can unassign task from users with member roles if you are team admin
    if (
      teamMembership?.role === 'admin' &&
      assigneeMembership?.role === 'member'
    ) {
      canUnassignTask = true;
    }

    // Can unassign a task from yourself if you a team admin
    if (
      teamMembership?.role === 'admin' &&
      teamMembership?.userId === task.assignee?.userId
    ) {
      canUnassignTask = true;
    }

    if (!canUnassignTask) {
      throw new Error('You are not allowed to unassign this task');
    }

    delete task.assignee;
    delete task.assigneeId;
    delete task.assigner;
    delete task.assignerId;
    task.updatedAt = new Date().toISOString();
    task.status = 'pending';
    // delete task.startAt;
    // delete task.endAt;

    await this.db.send(
      new PutCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Item: {
          PK: `TASK#${taskId}`,
          SK: `PROJECT#${task.projectId}`,
          ...task,
        },
      }),
    );

    // TODO notify assignee
    // TODO notify team owner if not changed by them
    // TODO notify task creator if not changed by them
    // TODO notify project owner if not changed by them

    return this.getTaskData(task);
  }

  async getTaskById(taskId: string) {
    const res = await this.db.send(
      new QueryCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        KeyConditionExpression: 'PK = :PK',
        ExpressionAttributeValues: {
          ':PK': `TASK#${taskId}`,
        },
      }),
    );

    if (!res.Items || res.Items.length === 0) {
      return null;
    }

    const task = res.Items[0];

    return this.getTaskData(task as Task);
  }

  async getTask(user: User, taskId: string) {
    const task = await this.getTaskById(taskId);

    if (!task) return null;

    const project = await this.projectsService.getProjectById(task.projectId);

    if (!project) {
      throw new Error('Project for the task not found');
    }

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
      ...task,
      // TODO comments
    };
  }

  async getUserTasks(user: User, userId: string) {
    if (user.userId !== userId) {
      throw new Error('You can only get your own tasks');
    }

    const res = await this.db.send(
      new ScanCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        FilterExpression:
          'begins_with(PK, :PK) AND begins_with(SK, :SK) AND assigneeId = :assigneeId',
        ExpressionAttributeValues: {
          ':PK': `TASK#`,
          ':SK': `PROJECT#`,
          ':assigneeId': userId,
        },
      }),
    );

    if (!res.Items || res.Items.length === 0) {
      return [];
    }
    const tasks = res.Items.map((task) => this.getTaskData(task as Task));
    const taskIds = tasks.map((task) => task?.taskId);
    const taskMap = new Map<string, Task>();
    tasks.forEach((task) => {
      if (task?.taskId) taskMap.set(task.taskId, task);
    });
    const taskList = taskIds.map((taskId) =>
      taskId ? taskMap.get(taskId) : null,
    );
    const taskListWithComments = taskList.map((task) => {
      if (!task) return null;
      return this.getTaskData(task);
    });
    return taskListWithComments.filter((task) => task !== null);
  }

  async getProjectTasks(user: User, projectId: string) {
    const project = await this.projectsService.getProjectById(projectId);

    if (!project) {
      throw new Error('Project was not found');
    }

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

    const res = await this.db.send(
      new ScanCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        FilterExpression: 'begins_with(PK, :PK) AND SK = :SK',
        ExpressionAttributeValues: {
          ':PK': `TASK#`,
          ':SK': `PROJECT#${projectId}`,
        },
      }),
    );

    if (!res.Items || res.Items.length === 0) {
      return [];
    }
    const tasks = res.Items.map((task) => this.getTaskData(task as Task));
    const taskIds = tasks.map((task) => task?.taskId);
    const taskMap = new Map<string, Task>();
    tasks.forEach((task) => {
      if (task?.taskId) taskMap.set(task.taskId, task);
    });
    const taskList = taskIds.map((taskId) =>
      taskId ? taskMap.get(taskId) : null,
    );
    const taskListWithComments = taskList.map((task) => {
      if (!task) return null;
      return this.getTaskData(task);
    });
    return taskListWithComments.filter((task) => task !== null);
  }

  async getPublicProjectTasks(projectId: string) {
    const project = await this.projectsService.getProjectById(projectId);

    if (!project) {
      throw new Error('Project was not found');
    }

    const team = await this.teamsService.getTeamById(project.teamId);

    if (!team) {
      throw new Error('Team for the project not found');
    }

    if (team.privacy === 'private') {
      throw new Error('You are not a member of this team');
    }

    const res = await this.db.send(
      new ScanCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        FilterExpression: 'begins_with(PK, :PK) AND SK = :SK',
        ExpressionAttributeValues: {
          ':PK': `TASK#`,
          ':SK': `PROJECT#${projectId}`,
        },
      }),
    );

    if (!res.Items || res.Items.length === 0) {
      return [];
    }
    const tasks = res.Items.map((task) => this.getTaskData(task as Task));
    const taskIds = tasks.map((task) => task?.taskId);
    const taskMap = new Map<string, Task>();
    tasks.forEach((task) => {
      if (task?.taskId) taskMap.set(task.taskId, task);
    });
    const taskList = taskIds.map((taskId) =>
      taskId ? taskMap.get(taskId) : null,
    );
    const taskListWithComments = taskList.map((task) => {
      if (!task) return null;
      return this.getTaskData(task);
    });
    return taskListWithComments.filter((task) => task !== null);
  }

  private validateDates(
    startAt: string | undefined,
    endAt: string | undefined,
    project: { startAt?: string; endAt?: string },
  ) {
    this.projectsService.validateDates(startAt, endAt);

    if (
      startAt &&
      project.startAt &&
      new Date(startAt) < new Date(project.startAt)
    ) {
      throw new Error('Task start date cannot be before project start date');
    }

    if (endAt && project.endAt && new Date(endAt) > new Date(project.endAt)) {
      throw new Error('Task end date cannot be after project end date');
    }
  }

  async createTask(user: User, dto: CreateTaskDto) {
    const project = await this.projectsService.getProjectById(dto.projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    if (this.projectsService.hasProjectEnded(project)) {
      throw new Error('Project has ended');
    }

    const team = await this.teamsService.getTeamById(project.teamId);

    if (!team) {
      throw new Error('Team not found');
    }

    const teamMembership: UserMembership | null =
      await this.teamsService.getTeamMembership(team.teamId, user.userId);

    if (
      !teamMembership ||
      teamMembership.role !== 'admin' ||
      teamMembership.status !== 'active'
    ) {
      throw new Error(
        "You are not allowed to create a task for this team's project",
      );
    }

    const taskId = uuidv4();
    const date = new Date().toISOString();

    const task: Task = {
      taskId,
      title: dto.title,
      description: dto.description,
      status: 'pending',
      projectId: dto.projectId,
      teamId: dto.teamId,
      createdAt: date,
      updatedAt: date,
      creator: this.teamsService.getUserSafeData(user),
    };

    this.validateDates(dto.startAt, dto.endAt, project);

    if (dto.startAt) {
      task.startAt = dto.startAt;
      task.endAt = dto.endAt;
    }

    const mashallOptions = {
      removeUndefinedValues: true,
    };

    const marshalledTask = marshall(task, mashallOptions);

    await this.db.send(
      new PutCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Item: {
          ...marshalledTask,
          PK: `TASK#${taskId}`,
          SK: `PROJECT#${dto.projectId}`,
        },
      }),
    );

    // TODO notify team members

    return this.getTaskData(task);
  }

  async updateTask(
    owner: User,
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task | null> {
    const task = await this.getTaskById(taskId);

    if (!task) {
      return null;
    }

    if (this.hasTaskEnded(task)) {
      throw new Error('Task has ended');
    }

    const project = await this.projectsService.getProjectById(task.projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    if (this.projectsService.hasProjectEnded(project)) {
      throw new Error('Project has ended');
    }

    const team = await this.teamsService.getTeamById(project.teamId);

    if (!team) {
      throw new Error('Team not found');
    }

    const teamMembership: UserMembership | null =
      await this.teamsService.getTeamMembership(team.teamId, owner.userId);

    if (
      !teamMembership ||
      teamMembership.status !== 'active' ||
      !teamMembership.isOwner ||
      teamMembership.role !== 'admin'
    ) {
      throw new Error('You cannot update project tasks for this team.');
    }

    if (owner.userId !== task.creator.userId || !teamMembership.isOwner) {
      throw new Error(
        'You are not the creator of this task nor the owner of the team.',
      );
    }

    let hasUpdate: boolean = false;

    // Add updateTaskDto fields to project if they exist and are not the same as that of the oldTask
    if (updateTaskDto.title && updateTaskDto.title !== task.title) {
      task.title = updateTaskDto.title;
      hasUpdate = true;
    }
    if (
      updateTaskDto.description &&
      updateTaskDto.description !== task.description
    ) {
      task.description = updateTaskDto.description;
      hasUpdate = true;
    }
    if (updateTaskDto.startAt && updateTaskDto.startAt !== task.startAt) {
      task.startAt = updateTaskDto.startAt;
      hasUpdate = true;
    }
    if (updateTaskDto.endAt && updateTaskDto.endAt !== task.endAt) {
      task.endAt = updateTaskDto.endAt;
      hasUpdate = true;
    }

    if (!hasUpdate) {
      throw new Error('No fields to update');
    }

    this.validateDates(task.startAt, task.endAt, project);

    task.updatedAt = new Date().toISOString();

    await this.db.send(
      new PutCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Item: {
          PK: `TASK#${taskId}`,
          SK: `PROJECT#${task.projectId}`,
          ...task,
        },
      }),
    );

    // TODO if not updated by team owner, notify owner
    // TODO if not updated by creator, notify creator
    // TODO if not updated by assignee, notify assignee

    return this.getTaskData(task);
  }

  async deleteTask(
    user: User,
    taskId: string,
  ): Promise<{ message: string } | null> {
    const task = await this.getTaskById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    if (this.hasTaskEnded(task)) {
      throw new Error('Task has ended');
    }

    const project = await this.projectsService.getProjectById(task.projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    if (this.projectsService.hasProjectEnded(project)) {
      throw new Error('Project has ended');
    }

    const team = await this.teamsService.getTeamById(project.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    const teamMembership: UserMembership | null =
      await this.teamsService.getTeamMembership(project.teamId, user.userId);

    if (
      !teamMembership ||
      teamMembership.status !== 'active' ||
      !teamMembership.isOwner ||
      teamMembership.userId !== task.creator.userId
    ) {
      throw new Error('You cannot delete this task.');
    }

    await this.db.send(
      new DeleteCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Key: {
          PK: `TASK#${taskId}`,
          SK: `PROJECT#${project.projectId}`,
        },
      }),
    );

    // TODO delete associated comments
    // TODO notify team members

    return { message: 'Task deleted successfully' };
  }

  async changeTaskStatus(
    user: User,
    taskId: string,
    dto: ChangeTaskStatusDto,
  ): Promise<Task | null> {
    const task: Task | null = await this.getTaskById(taskId);

    if (!task) {
      return null;
    }

    const team = await this.teamsService.getTeamById(task.teamId);
    if (!team) {
      throw new Error('Team not found');
    }
    const teamMembership: UserMembership | null =
      await this.teamsService.getTeamMembership(team.teamId, user.userId);

    if (!teamMembership || teamMembership.status !== 'active') {
      throw new Error('You are not an active member of this team');
    }

    if (
      team.ownerId !== user.userId ||
      teamMembership.userId !== task.creator.userId ||
      teamMembership.userId !== task.assignee?.userId ||
      teamMembership.isOwner
    ) {
      throw new Error('You cannot change the status of this task');
    }

    if (task.status === dto.status) {
      throw new Error('Task status is already set to this value');
    }

    if (!this.isTaskActive(task)) {
      throw new Error('Task is not active');
    }

    // TODO notify owner if not changed by them
    // TODO notify assignee if not changed by them
    // TODO notify creator if not changed by them

    await this.updateTaskStatus(user.userId, task.projectId, dto.status);

    return this.getTaskData({ ...task, status: dto.status });
  }

  private async updateTaskStatus(
    taskId: string,
    projectId: string,
    status: 'pending' | 'in-progress' | 'done',
  ): Promise<void> {
    await this.db.send(
      new UpdateCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Key: {
          PK: `TASK#${taskId}`,
          SK: `PROJECT#${projectId}`,
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

  private getTaskData(task): Task | null {
    if (!task) {
      return null;
    }

    if (!task.taskId?.S)
      return {
        taskId: task.taskId,
        title: task.title,
        description: task.description,
        status: task.status,
        projectId: task.projectId,
        assigner: task.assigner,
        assignee: task.assignee,
        teamId: task.teamId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        startAt: task.startAt,
        endAt: task.endAt,
        creator: task.creator,
      };

    return {
      taskId: task.taskId?.S,
      title: task.title?.S,
      description: task.description?.S,
      projectId: task.projectId?.S,
      status: task.status?.S,
      startAt: task.startAt?.S,
      endAt: task.endAt?.S,
      creator: this.teamsService.transformObject(task.creator?.M),
      assignee: this.teamsService.transformObject(task.assignee?.M),
      assigner: this.teamsService.transformObject(task.assigner?.M),
      teamId: task.teamId?.S,
      createdAt: task.createdAt?.S,
      updatedAt: task.updatedAt?.S,
    } as Task;
  }

  hasTaskEnded(task: Task): boolean {
    if (!task.endAt) {
      return false;
    }
    const endDate = new Date(task.endAt);
    const currentDate = new Date();
    return endDate < currentDate;
  }

  isTaskInProgress(task: Task): boolean {
    if (!task.startAt || !task.endAt) {
      return false;
    }
    const startDate = new Date(task.startAt);
    const endDate = new Date(task.endAt);
    const currentDate = new Date();
    return startDate <= currentDate && currentDate <= endDate;
  }

  isTaskUpcoming(task: Task): boolean {
    if (!task.startAt) {
      return false;
    }
    const startDate = new Date(task.startAt);
    const currentDate = new Date();
    return startDate > currentDate;
  }

  isTaskOverdue(task: Task): boolean {
    if (!task.endAt) {
      return false;
    }
    const endDate = new Date(task.endAt);
    const currentDate = new Date();
    return endDate < currentDate;
  }

  isTaskActive(task: Task): boolean {
    return (
      this.isTaskInProgress(task) ||
      this.isTaskUpcoming(task) ||
      !this.hasTaskEnded(task)
    );
  }
}
