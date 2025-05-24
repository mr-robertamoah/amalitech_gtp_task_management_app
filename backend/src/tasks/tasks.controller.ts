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
import { TasksService } from './tasks.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/interfaces/users.interface';
import { GetUser } from 'src/auth/get-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ChangeTaskStatusDto } from './dto/change-task-status.dto';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':taskId')
  async getTask(@Param('taskId') taskId: string, @GetUser() user: User) {
    const task = await this.tasksService.getTask(user, taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('projects/:projectId')
  async getProjectTasks(
    @Param('projectId') projectId: string,
    @GetUser() user: User,
  ) {
    return await this.tasksService.getProjectTasks(user, projectId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('')
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() owner: User,
  ) {
    return await this.tasksService.createTask(owner, createTaskDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':taskId/change-status')
  async changeTaskStatus(
    @Param('taskId') taskId: string,
    @GetUser() user: User,
    @Body() dto: ChangeTaskStatusDto,
  ) {
    return await this.tasksService.changeTaskStatus(user, taskId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':taskId')
  async updateTask(
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: User,
  ) {
    const task = await this.tasksService.updateTask(
      user,
      taskId,
      updateTaskDto,
    );

    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':taskId')
  async deleteTask(@Param('taskId') taskId: string, @GetUser() user: User) {
    return await this.tasksService.deleteTask(user, taskId);
  }
}
