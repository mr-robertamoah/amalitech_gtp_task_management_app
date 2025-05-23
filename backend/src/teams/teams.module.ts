import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { dynamoProvider } from 'src/database/dynamo.provider';
import { UsersService } from 'src/users/users.service';

@Module({
  providers: [TeamsService, dynamoProvider, UsersService],
  controllers: [TeamsController],
  exports: [TeamsService],
})
export class TeamsModule {}
