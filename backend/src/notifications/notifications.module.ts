import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EmailModule } from '../email/email.module';
import { dynamoProvider } from 'src/database/dynamo.provider';

@Module({
  imports: [EmailModule],
  providers: [NotificationsService, dynamoProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {}
