import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalTaskEntity } from './personal-task.entity';
import { ProjectEntity } from './project.entity';
import { ProjectTaskEntity } from './project-task.entity';
import { PersonalWorkspaceController } from './personal-workspace.controller';
import { PersonalWorkspaceResolver } from './personal-workspace.resolver';
import { PersonalWorkspaceService } from './personal-workspace.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PersonalTaskEntity,
      ProjectEntity,
      ProjectTaskEntity,
    ]),
  ],
  controllers: [PersonalWorkspaceController],
  providers: [PersonalWorkspaceService, PersonalWorkspaceResolver],
  exports: [PersonalWorkspaceService, TypeOrmModule],
})
export class PersonalWorkspaceModule {}
