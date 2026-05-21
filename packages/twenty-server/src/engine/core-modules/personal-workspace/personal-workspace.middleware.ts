import { Injectable, type NestMiddleware } from '@nestjs/common';
import { type Request, type Response, type NextFunction } from 'express';
import { PersonalWorkspaceService } from './personal-workspace.service';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

@Injectable()
export class PersonalWorkspaceMiddleware implements NestMiddleware {
  constructor(private readonly service: PersonalWorkspaceService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.path.startsWith('/api/personal-workspace')) return next();

    const subPath = req.path.replace('/api/personal-workspace', '') || '/tasks';
    const method = req.method;

    try {
      if (method === 'GET' && subPath === '/tasks') {
        return res.json(await this.service.getPersonalTasks(DEMO_USER_ID));
      }
      if (method === 'POST' && subPath === '/tasks') {
        return res.status(201).json(await this.service.createPersonalTask(DEMO_USER_ID, req.body));
      }
      if (method === 'GET' && subPath === '/today') {
        return res.json(await this.service.getTodayTasks(DEMO_USER_ID));
      }
      if (method === 'GET' && subPath === '/projects') {
        return res.json(await this.service.getProjects(DEMO_USER_ID));
      }
      if (method === 'POST' && subPath === '/projects') {
        return res.status(201).json(await this.service.createProject(DEMO_USER_ID, req.body));
      }
      if (method === 'GET' && subPath.match(/^\/projects\/(.+)\/tasks$/)) {
        const projectId = subPath.match(/^\/projects\/(.+)\/tasks$/)?.[1];
        return res.json(await this.service.getProjectTasks(projectId!));
      }
      if (method === 'POST' && subPath.match(/^\/projects\/(.+)\/tasks$/)) {
        const projectId = subPath.match(/^\/projects\/(.+)\/tasks$/)?.[1];
        return res.status(201).json(await this.service.createProjectTask(projectId!, req.body));
      }
      res.status(404).json({ error: 'Not found' });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }
}
