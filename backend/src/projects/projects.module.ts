import { forwardRef, Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { dynamoProvider } from 'src/database/dynamo.provider';
import { UsersModule } from 'src/users/users.module';
import { TeamsModule } from 'src/teams/teams.module';

@Module({
  providers: [ProjectsService, dynamoProvider],
  controllers: [ProjectsController],
  imports: [
    forwardRef(() => TeamsModule),
    UsersModule, // Import the UsersModule
  ],
})
export class ProjectsModule {}
