import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { User } from './interfaces/users.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DYNAMO_CLIENT') private readonly db: DynamoDBDocumentClient,
  ) {}

  async getUsers(): Promise<User[]> {
    const res = await this.db.send(
      new ScanCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        FilterExpression: 'begins_with(PK, :PK) AND SK = :SK',
        ExpressionAttributeValues: {
          ':PK': 'USER#',
          ':SK': 'METADATA',
        },
      }),
    );

    if (!res.Items || res.Items.length === 0) {
      return [];
    }

    return res.Items.map((item) =>
      this.getUserData(item as User | null),
    ) as User[];
  }

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

  async getUserByUsername(username: string): Promise<User | null> {
    const res = await this.db.send(
      new ScanCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        FilterExpression: 'username = :val',
        ExpressionAttributeValues: {
          ':val': username,
        },
      }),
    );

    if (res.Items && res.Items.length > 0) {
      return res.Items[0] as User;
    }
    return null;
  }

  async searchUsers(userOrUsername: string): Promise<User[]> {
    const res = await this.db.send(
      new ScanCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        FilterExpression: 'contains(username, :val1) OR contains(email, :val2)',
        ExpressionAttributeValues: {
          ':val1': userOrUsername,
          ':val2': userOrUsername,
        },
      }),
    );

    if (!res.Items || res.Items.length == 0) {
      return [];
    }
    return res.Items.map((item) =>
      this.getUserData(item as User | null),
    ) as User[];
  }

  async getUserByUsernameOrEmail(data: {
    username?: string;
    email?: string;
  }): Promise<User | null> {
    const res = await this.db.send(
      new ScanCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        FilterExpression: 'username = :val1 OR email = :val2',
        ExpressionAttributeValues: {
          ':val1': data.username,
          ':val2': data.email,
        },
      }),
    );

    if (res.Items && res.Items.length > 0) {
      return res.Items[0] as User;
    }
    return null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const res = await this.db.send(
      new ScanCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        FilterExpression: 'email = :val',
        ExpressionAttributeValues: {
          ':val': email,
        },
      }),
    );

    if (res.Items && res.Items.length > 0) {
      return res.Items[0] as User;
    }
    return null;
  }

  async getUser(userId: string): Promise<User | null> {
    const user = await this.getUserById(userId);

    if (!user) {
      return null;
    }

    return this.getUserData(user);
  }

  async createUser(user: {
    userId: string;
    username: string;
    email: string;
    password: string;
  }): Promise<User | null> {
    // Check if user with the same username or email already exists
    const existingUser = await this.getUserByUsernameOrEmail({
      username: user.username,
      email: user.email,
    });

    if (existingUser) {
      throw new Error('User with this username or email already exists');
    }

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

      return this.getUserData(user as User);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('User creation failed');
    }
  }

  async updateUser(
    userId: string,
    updates: Partial<{
      username?: string;
      email?: string;
      name?: string;
      bio?: string;
      avatarUrl?: string;
    }>,
  ): Promise<User | null> {
    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('No updates provided');
    }
    let user = await this.getUserById(userId);
    if (!user) {
      return null;
    }

    user = this.getUserData(user) as User;
    let hasUpdate: boolean = false;
    // ensure username and email are not already taken
    if (updates.username) {
      const existingUser = await this.getUserByUsername(updates.username);
      if (existingUser && existingUser.userId !== userId) {
        throw new Error('Username already taken');
      }

      if (updates.username !== user.username) {
        user.username = updates.username;
        hasUpdate = true;
      }
    }
    if (updates.email) {
      const existingUser = await this.getUserByEmail(updates.email);
      if (existingUser && existingUser.userId !== userId) {
        throw new Error('Email already taken');
      }

      if (updates.email !== user.email) {
        user.email = updates.email;
        hasUpdate = true;
      }
    }

    if (updates.name && updates.name !== user.name) {
      user.name = updates.name;
      hasUpdate = true;
    }

    if (updates.bio && updates.bio !== user.bio) {
      user.bio = updates.bio;
      hasUpdate = true;
    }

    if (updates.avatarUrl && updates.avatarUrl !== user.avatarUrl) {
      user.avatarUrl = updates.avatarUrl;
      hasUpdate = true;
    }

    if (!hasUpdate) {
      throw new Error('No updates provided');
    }

    try {
      await this.db.send(
        new UpdateCommand({
          TableName: process.env.DYNAMO_TABLE_NAME,
          Key: {
            PK: `USER#${userId}`,
            SK: 'METADATA',
          },
          UpdateExpression:
            'SET #username = :username, #email = :email, #name = :name, #bio = :bio, #avatarUrl = :avatarUrl',
          ExpressionAttributeNames: {
            '#username': 'username',
            '#email': 'email',
            '#name': 'name',
            '#bio': 'bio',
            '#avatarUrl': 'avatarUrl',
          },
          ExpressionAttributeValues: {
            ':username': user.username,
            ':email': user.email,
            ':name': user.name || '',
            ':bio': user.bio || '',
            ':avatarUrl': user.avatarUrl || '',
          },
        }),
      );

      return this.getUserData(user);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('User update failed');
    }
  }

  async deleteUser(userId: string): Promise<{ message: string } | null> {
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

    return { message: 'User deleted successfully' };
    // Any team membership records (TEAM#<teamId> with SK = MEMBER#<userId>)
    // Any tasks/comments assigned to the user (use batch delete or DynamoDB Streams to automate cascading deletes)
  }

  private getUserData(user: User | null): User | null {
    if (!user) {
      return null;
    }

    return {
      userId: user.userId,
      username: user.username,
      email: user.email,
      name: user.name || '',
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      teams: user.teams || [],
      createdAt: user.createdAt || new Date().toISOString(),
    };
  }

  async changeUserPassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<User | null> {
    const user = await this.getUserById(userId);
    if (!user) {
      return null;
    }

    // Check if old password matches
    if (
      user.password &&
      !(await bcrypt.compare(changePasswordDto.oldPassword, user.password))
    ) {
      throw new Error('Old password is incorrect');
    }

    // Update password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    try {
      await this.db.send(
        new UpdateCommand({
          TableName: process.env.DYNAMO_TABLE_NAME,
          Key: {
            PK: `USER#${userId}`,
            SK: 'METADATA',
          },
          UpdateExpression: 'SET #password = :password',
          ExpressionAttributeNames: {
            '#password': 'password',
          },
          ExpressionAttributeValues: {
            ':password': hashedPassword,
          },
        }),
      );

      return this.getUserData(user);
    } catch (error) {
      console.error('Error changing password:', error);
      throw new Error('Password change failed');
    }
  }
}
