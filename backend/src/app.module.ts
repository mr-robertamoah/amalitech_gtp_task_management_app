import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { TeamsModule } from './teams/teams.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { NotificationController } from './notification/notification.controller';

@Module({
  imports: [AuthModule, UsersModule, TasksModule, TeamsModule, CommentsModule, NotificationsModule],
  controllers: [AppController, NotificationController],
  providers: [AppService],
})
export class AppModule {}
