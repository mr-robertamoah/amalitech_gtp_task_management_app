import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { dynamoProvider } from 'src/database/dynamo.provider';
import { TeamsModule } from 'src/teams/teams.module';
import { ProjectsModule } from 'src/projects/projects.module';
import { ProjectsService } from 'src/projects/projects.service';
import { UsersModule } from 'src/users/users.module';
import { EmailService } from 'src/email/email.service';
import { EmailModule } from 'src/email/email.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  providers: [TasksService, dynamoProvider, ProjectsService, EmailService],
  controllers: [TasksController],
  imports: [
    TeamsModule,
    ProjectsModule,
    UsersModule,
    EmailModule,
    NotificationsModule,
  ],
})
export class TasksModule {}
