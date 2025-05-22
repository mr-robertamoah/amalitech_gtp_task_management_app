import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { dynamoProvider } from '../database/dynamo.provider';

@Module({
  providers: [UsersService, dynamoProvider],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
