import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { User } from './interfaces/users.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DYNAMO_CLIENT') private readonly db: DynamoDBDocumentClient,
  ) {}

  async getUserById(userId: string): Promise<User | null> {
    const res = await this.db.send(
      new GetCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: 'METADATA',
        },
      }),
    );

    return res.Item as User | null;
  }

  async createUser(user: {
    userId: string;
    username: string;
    email: string;
    password: string;
  }): Promise<any> {
    try {
      await this.db.send(
        new PutCommand({
          TableName: process.env.DYNAMO_TABLE_NAME,
          Item: {
            PK: `USER#${user.userId}`,
            SK: 'METADATA',
            ...user,
            createdAt: new Date().toISOString(),
            type: 'User',
          },
        }),
      );

      return {
        userId: user.userId,
        username: user.username,
        email: user.email,
        teams: [],
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('User creation failed');
    }
  }

  async updateUser(
    userId: string,
    updates: Partial<{ username: string; email: string }>,
  ): Promise<User | null> {
    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('No updates provided');
    }
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updateExpr = [];
    const exprAttrNames: Record<string, string> = {};
    const exprAttrValues: Record<string, any> = {};

    for (const key of Object.keys(updates)) {
      updateExpr.push(`#${key} = :${key}`);
      exprAttrNames[`#${key}`] = key;
      exprAttrValues[`:${key}`] = (updates as any)[key];
    }

    try {
      await this.db.send(
        new UpdateCommand({
          TableName: process.env.DYNAMO_TABLE_NAME,
          Key: {
            PK: `USER#${userId}`,
            SK: 'METADATA',
          },
          UpdateExpression: `SET ${updateExpr.join(', ')}`,
          ExpressionAttributeNames: exprAttrNames,
          ExpressionAttributeValues: exprAttrValues,
        }),
      );

      const updatedUser = await this.getUserById(userId);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('User update failed');
    }
  }

  async deleteUser(userId: string): Promise<any> {
    try {
      await this.db.send(
        new DeleteCommand({
          TableName: process.env.DYNAMO_TABLE_NAME,
          Key: {
            PK: `USER#${userId}`,
            SK: 'METADATA',
          },
        }),
      );
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('User deletion failed');
    }
  }
  //   Any team membership records (TEAM#<teamId> with SK = MEMBER#<userId>)
  // Any tasks/comments assigned to the user (use batch delete or DynamoDB Streams to automate cascading deletes)
}
