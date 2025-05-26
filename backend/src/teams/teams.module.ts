import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { dynamoProvider } from 'src/database/dynamo.provider';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  providers: [TeamsService, dynamoProvider],
  controllers: [TeamsController],
  exports: [TeamsService],
  imports: [UsersModule, EmailModule],
})
export class TeamsModule {}
