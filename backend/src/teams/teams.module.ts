import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { dynamoProvider } from 'src/database/dynamo.provider';

@Module({
  providers: [TeamsService, dynamoProvider],
  controllers: [TeamsController],
  exports: [TeamsService],
})
export class TeamsModule {}
