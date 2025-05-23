import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { dynamoProvider } from 'src/database/dynamo.provider';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [TeamsService, dynamoProvider],
  controllers: [TeamsController],
  exports: [TeamsService],
  imports: [UsersModule],
})
export class TeamsModule {}
