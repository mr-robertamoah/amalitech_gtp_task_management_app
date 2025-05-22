// dynamodb.service.ts
import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoDbService {
  private docClient: DynamoDBDocumentClient;

  constructor() {
    const client = new DynamoDBClient({
      region: 'us-east-1', // adjust as needed
    });

    this.docClient = DynamoDBDocumentClient.from(client);
  }

  async putItem(tableName: string, item: any) {
    const command = new PutCommand({
      TableName: tableName,
      Item: item,
    });
    await this.docClient.send(command);
  }

  async getItem(tableName: string, key: any) {
    const command = new GetCommand({
      TableName: tableName,
      Key: key,
    });
    const result = await this.docClient.send(command);
    return result.Item;
  }
}
