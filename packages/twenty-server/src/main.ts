import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';

import fs from 'fs';
import { Router } from 'express';
import { PersonalWorkspaceService } from './engine/core-modules/personal-workspace/personal-workspace.service';

import bytes from 'bytes';
import { useContainer } from 'class-validator';
import session from 'express-session';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { setPgDateTypeParser } from 'src/database/pg/set-pg-date-type-parser';
import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import { getSessionStorageOptions } from 'src/engine/core-modules/session-storage/session-storage.module-factory';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { configTransformers } from 'src/engine/core-modules/twenty-config/utils/config-transformers.util';
import { UnhandledExceptionFilter } from 'src/filters/unhandled-exception.filter';

import { AppModule } from './app.module';
import './instrument';

import { settings } from './engine/constants/settings';
import { generateFrontConfig } from './utils/generate-front-config';

// Trigger
const bootstrap = async () => {
  setPgDateTypeParser();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Expose WWW-Authenticate so browser-based MCP clients can read the
    // resource_metadata pointer on 401. Required by MCP authorization spec.
    cors: { exposedHeaders: ['WWW-Authenticate'] },
    bufferLogs: process.env.LOGGER_IS_BUFFER_ENABLED === 'true',
    rawBody: true,
    snapshot: process.env.NODE_ENV === NodeEnvironment.DEVELOPMENT,
    ...(process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH
      ? {
          httpsOptions: {
            key: fs.readFileSync(process.env.SSL_KEY_PATH),
            cert: fs.readFileSync(process.env.SSL_CERT_PATH),
          },
        }
      : {}),
  });
  const logger = app.get(LoggerService);
  const twentyConfigService = app.get(TwentyConfigService);

  const trustProxyRaw = twentyConfigService.get('TRUST_PROXY');
  const trustProxy = /^\d+$/.test(trustProxyRaw)
    ? Number(trustProxyRaw)
    : (configTransformers.boolean(trustProxyRaw) ?? trustProxyRaw);

  app.set('trust proxy', trustProxy);

  app.use(session(getSessionStorageOptions(twentyConfigService)));

  // Apply class-validator container so that we can use injection in validators
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Use our logger
  app.useLogger(logger);

  app.useGlobalFilters(new UnhandledExceptionFilter());

  app.useBodyParser('json', { limit: settings.storage.maxFileSize });
  app.useBodyParser('urlencoded', {
    limit: settings.storage.maxFileSize,
    extended: true,
  });
  app.useBodyParser('text', { type: 'text/plain', limit: '1024kb' });

  // Graphql file upload
  app.use(
    '/graphql',
    graphqlUploadExpress({
      maxFieldSize: bytes(settings.storage.maxFileSize)!,
      maxFiles: 10,
    }),
  );

  app.use(
    '/metadata',
    graphqlUploadExpress({
      maxFieldSize: bytes(settings.storage.maxFileSize)!,
      maxFiles: 10,
    }),
  );

  // Inject the server url in the frontend page
  generateFrontConfig();

  // Personal Workspace API - registered at Express level to bypass NestJS middleware
  const personalWorkspaceRouter = Router();
  const personalWorkspaceService = app.get(PersonalWorkspaceService);
  const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

  personalWorkspaceRouter.get('/tasks', async (req, res) => {
    const tasks = await personalWorkspaceService.getPersonalTasks(DEMO_USER_ID);
    res.json(tasks);
  });

  personalWorkspaceRouter.post('/tasks', async (req, res) => {
    const task = await personalWorkspaceService.createPersonalTask(DEMO_USER_ID, req.body);
    res.status(201).json(task);
  });

  personalWorkspaceRouter.put('/tasks/:id', async (req, res) => {
    const task = await personalWorkspaceService.updatePersonalTask(req.params.id, DEMO_USER_ID, req.body);
    res.json(task);
  });

  personalWorkspaceRouter.delete('/tasks/:id', async (req, res) => {
    await personalWorkspaceService.deletePersonalTask(req.params.id, DEMO_USER_ID);
    res.json({ success: true });
  });

  personalWorkspaceRouter.get('/today', async (req, res) => {
    const tasks = await personalWorkspaceService.getTodayTasks(DEMO_USER_ID);
    res.json(tasks);
  });

  personalWorkspaceRouter.get('/projects', async (req, res) => {
    const projects = await personalWorkspaceService.getProjects(DEMO_USER_ID);
    res.json(projects);
  });

  personalWorkspaceRouter.post('/projects', async (req, res) => {
    const project = await personalWorkspaceService.createProject(DEMO_USER_ID, req.body);
    res.status(201).json(project);
  });

  personalWorkspaceRouter.delete('/projects/:id', async (req, res) => {
    await personalWorkspaceService.deleteProject(req.params.id, DEMO_USER_ID);
    res.json({ success: true });
  });

  personalWorkspaceRouter.get('/projects/:projectId/tasks', async (req, res) => {
    const tasks = await personalWorkspaceService.getProjectTasks(req.params.projectId);
    res.json(tasks);
  });

  personalWorkspaceRouter.post('/projects/:projectId/tasks', async (req, res) => {
    const task = await personalWorkspaceService.createProjectTask(req.params.projectId, req.body);
    res.status(201).json(task);
  });

  const expressApp = app.getHttpAdapter().getInstance();

  // Simple test route
  expressApp.get('/api/test', (req, res) => { res.json({ok:true}); });

  // Personal Workspace API
  expressApp.use('/api/personal-workspace', personalWorkspaceRouter);

  await app.listen(twentyConfigService.get('NODE_PORT'));
};

void bootstrap();
