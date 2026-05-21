import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode } from '@nestjs/common';
import { PersonalWorkspaceService } from './personal-workspace.service';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

@Controller('api/personal-workspace')
export class PersonalWorkspaceController {
  constructor(private readonly service: PersonalWorkspaceService) {}

  @Get('tasks')
  getTasks() {
    return this.service.getPersonalTasks(DEMO_USER_ID);
  }

  @Post('tasks')
  @HttpCode(201)
  createTask(@Body() body: any) {
    return this.service.createPersonalTask(DEMO_USER_ID, body);
  }

  @Get('today')
  getToday() {
    return this.service.getTodayTasks(DEMO_USER_ID);
  }

  @Get('projects')
  getProjects() {
    return this.service.getProjects(DEMO_USER_ID);
  }

  @Post('projects')
  @HttpCode(201)
  createProject(@Body() body: any) {
    return this.service.createProject(DEMO_USER_ID, body);
  }

  @Get('projects/:projectId/tasks')
  getProjectTasks(@Param('projectId') projectId: string) {
    return this.service.getProjectTasks(projectId);
  }

  @Post('projects/:projectId/tasks')
  @HttpCode(201)
  createProjectTask(@Param('projectId') projectId: string, @Body() body: any) {
    return this.service.createProjectTask(projectId, body);
  }
}
