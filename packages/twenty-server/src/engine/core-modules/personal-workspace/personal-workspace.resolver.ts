import { Args, Mutation, Query } from '@nestjs/graphql';
import { PersonalTaskEntity } from './personal-task.entity';
import { ProjectEntity } from './project.entity';
import { ProjectTaskEntity } from './project-task.entity';
import { PersonalWorkspaceService } from './personal-workspace.service';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

@MetadataResolver(() => PersonalTaskEntity)
export class PersonalWorkspaceResolver {
  constructor(private readonly service: PersonalWorkspaceService) {}

  @Query(() => [PersonalTaskEntity])
  async personalTasks() {
    return this.service.getPersonalTasks(DEMO_USER_ID);
  }

  @Mutation(() => PersonalTaskEntity)
  async createPersonalTask(
    @Args('title') title: string,
    @Args({ name: 'description', nullable: true }) description?: string,
    @Args({ name: 'priority', defaultValue: 'medium' }) priority?: string,
    @Args({ name: 'dueDate', nullable: true, type: () => Date }) dueDate?: Date,
    @Args({ name: 'tags', nullable: true, type: () => [String] }) tags?: string[],
  ) {
    return this.service.createPersonalTask(DEMO_USER_ID, {
      title, description,
      priority: priority as 'high' | 'medium' | 'low',
      dueDate, tags,
    });
  }

  @Mutation(() => PersonalTaskEntity)
  async updatePersonalTask(
    @Args('id') id: string,
    @Args({ name: 'title', nullable: true }) title?: string,
    @Args({ name: 'completed', nullable: true }) completed?: boolean,
    @Args({ name: 'priority', nullable: true }) priority?: string,
    @Args({ name: 'dueDate', nullable: true, type: () => Date }) dueDate?: Date,
  ) {
    return this.service.updatePersonalTask(id, DEMO_USER_ID, {
      title, completed,
      priority: priority as 'high' | 'medium' | 'low',
      dueDate,
    } as any);
  }

  @Mutation(() => Boolean)
  async deletePersonalTask(@Args('id') id: string) {
    await this.service.deletePersonalTask(id, DEMO_USER_ID);
    return true;
  }

  @Query(() => String, { nullable: true })
  async todayTasks() {
    return JSON.stringify(await this.service.getTodayTasks(DEMO_USER_ID));
  }

  @Query(() => [ProjectEntity])
  async projects() {
    return this.service.getProjects(DEMO_USER_ID);
  }

  @Mutation(() => ProjectEntity)
  async createProject(
    @Args('name') name: string,
    @Args({ name: 'description', nullable: true }) description?: string,
    @Args({ name: 'dueDate', nullable: true, type: () => Date }) dueDate?: Date,
  ) {
    return this.service.createProject(DEMO_USER_ID, { name, description, dueDate });
  }

  @Mutation(() => Boolean)
  async deleteProject(@Args('id') id: string) {
    await this.service.deleteProject(id, DEMO_USER_ID);
    return true;
  }

  @Query(() => [ProjectTaskEntity])
  async projectTasks(@Args('projectId') projectId: string) {
    return this.service.getProjectTasks(projectId);
  }

  @Mutation(() => ProjectTaskEntity)
  async createProjectTask(
    @Args('projectId') projectId: string,
    @Args('title') title: string,
    @Args({ name: 'priority', defaultValue: 'medium' }) priority?: string,
    @Args({ name: 'dueDate', nullable: true, type: () => Date }) dueDate?: Date,
  ) {
    return this.service.createProjectTask(projectId, {
      title, priority: priority as 'high' | 'medium' | 'low', dueDate,
    });
  }

  @Mutation(() => Boolean)
  async completeProjectTask(@Args('id') id: string) {
    await this.service.updateProjectTask(id, { completed: true } as any);
    return true;
  }

  @Mutation(() => Boolean)
  async deleteProjectTask(@Args('id') id: string) {
    await this.service.deleteProjectTask(id);
    return true;
  }
}
