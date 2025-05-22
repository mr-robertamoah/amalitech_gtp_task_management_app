import { Module } from '@nestjs/common';
import { dynamoProvider } from './dynamo.provider';

@Module({
  providers: [dynamoProvider],
  exports: [dynamoProvider],
})
export class DatabaseModule {}
