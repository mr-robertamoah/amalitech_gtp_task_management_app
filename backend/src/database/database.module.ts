import { Module } from '@nestjs/common';
import { dynamoProvider } from './dynamo.provider';
import { DynamoDbService } from './database.service';

@Module({
  providers: [dynamoProvider, DynamoDbService],
  exports: [dynamoProvider, DynamoDbService],
})
export class DatabaseModule {}
