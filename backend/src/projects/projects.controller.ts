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
import { ProjectsService } from './projects.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/users/interfaces/users.interface';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':projectId')
  async getProject(
    @Param('projectId') projectId: string,
    @GetUser() user: User,
  ) {
    const project = await this.projectsService.getProject(user, projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('')
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @GetUser() owner: User,
  ) {
    return await this.projectsService.createProject(owner, createProjectDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':projectId')
  async updateProject(
    @Param('projectId') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @GetUser() owner: User,
  ) {
    const project = await this.projectsService.updateProject(
      owner,
      projectId,
      updateProjectDto,
    );

    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':projectId')
  async deleteProject(
    @Param('projectId') projectId: string,
    @GetUser() owner: User,
  ) {
    return await this.projectsService.deleteProject(owner, projectId);
  }
}
