import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { dynamoProvider } from 'src/database/dynamo.provider';
import { ProjectsModule } from 'src/projects/projects.module';
import { TeamsModule } from 'src/teams/teams.module';
import { TasksModule } from 'src/tasks/tasks.module';
import { ProjectsService } from 'src/projects/projects.service';
import { TeamsService } from 'src/teams/teams.service';
import { TasksService } from 'src/tasks/tasks.service';
import { UsersModule } from 'src/users/users.module';
import { EmailModule } from 'src/email/email.module';
import { EmailService } from 'src/email/email.service';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  providers: [
    CommentsService,
    dynamoProvider,
    ProjectsService,
    TeamsService,
    TasksService,
    EmailService,
  ],
  controllers: [CommentsController],
  imports: [
    ProjectsModule,
    TeamsModule,
    TasksModule,
    UsersModule,
    EmailModule,
    NotificationsModule,
  ],
})
export class CommentsModule {}
