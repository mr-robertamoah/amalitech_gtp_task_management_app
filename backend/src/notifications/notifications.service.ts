import { Inject, Injectable } from '@nestjs/common';
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { EmailService } from '../email/email.service';
import { Task } from 'src/tasks/interfaces/tasks.interface';

interface TaskNotification {
  PK: string;
  SK: string;
  taskId: string;
  taskTitle: string;
  assigneeEmail: string;
  assignerEmail: string;
  endAt: string;
  notified: boolean;
}

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('DYNAMO_CLIENT') private readonly db: DynamoDBDocumentClient,
    private readonly emailService: EmailService,
  ) {}

  async createOrUpdateNotification(task: Task): Promise<void> {
    // Only create notification if task has an endAt date and an assignee
    if (!task.endAt || !task.assignee) {
      return;
    }

    const notification: TaskNotification = {
      PK: `NOTIFICATION#${task.taskId}`,
      SK: `TASK#${task.taskId}`,
      taskId: task.taskId,
      taskTitle: task.title,
      assigneeEmail: task.assignee.email,
      assignerEmail: task.assigner?.email || '',
      endAt: task.endAt,
      notified: false,
    };

    await this.db.send(
      new PutCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Item: notification,
      }),
    );
  }

  async deleteNotification(taskId: string): Promise<void> {
    await this.db.send(
      new DeleteCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Key: {
          PK: `NOTIFICATION#${taskId}`,
          SK: `TASK#${taskId}`,
        },
      }),
    );
  }

  async getNotificationsDueToday(): Promise<TaskNotification[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];

    const result = await this.db.send(
      new QueryCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        KeyConditionExpression: 'begins_with(PK, :pk)',
        FilterExpression: 'begins_with(endAt, :today) AND notified = :notified',
        ExpressionAttributeValues: {
          ':pk': 'NOTIFICATION#',
          ':today': todayStr,
          ':notified': false,
        },
      }),
    );

    return result.Items as TaskNotification[];
  }

  async sendNotifications(notifications: TaskNotification[]): Promise<void> {
    for (const notification of notifications) {
      await this.emailService.sendEmail(
        [notification.assigneeEmail],
        `Task Deadline Reminder: ${notification.taskTitle}`,
        `This is a reminder that your task "${notification.taskTitle}" is due today.`,
        notification.assignerEmail,
      );

      // Mark as notified
      await this.db.send(
        new PutCommand({
          TableName: process.env.DYNAMO_TABLE_NAME,
          Item: {
            ...notification,
            notified: true,
          },
        }),
      );
    }
  }
}
