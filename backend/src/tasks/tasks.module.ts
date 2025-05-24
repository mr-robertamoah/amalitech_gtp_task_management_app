import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { dynamoProvider } from 'src/database/dynamo.provider';
import { TeamsModule } from 'src/teams/teams.module';
import { ProjectsModule } from 'src/projects/projects.module';
import { ProjectsService } from 'src/projects/projects.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [TasksService, dynamoProvider, ProjectsService],
  controllers: [TasksController],
  imports: [TeamsModule, ProjectsModule, UsersModule],
})
export class TasksModule {}
