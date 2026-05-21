import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalTaskEntity } from './personal-task.entity';
import { ProjectEntity } from './project.entity';
import { ProjectTaskEntity } from './project-task.entity';

@Injectable()
export class PersonalWorkspaceService {
  constructor(
    @InjectRepository(PersonalTaskEntity)
    private personalTaskRepo: Repository<PersonalTaskEntity>,
    @InjectRepository(ProjectEntity)
    private projectRepo: Repository<ProjectEntity>,
    @InjectRepository(ProjectTaskEntity)
    private projectTaskRepo: Repository<ProjectTaskEntity>,
  ) {}

  // Personal Tasks
  async getPersonalTasks(userId: string) {
    return this.personalTaskRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async createPersonalTask(userId: string, data: Partial<PersonalTaskEntity>) {
    return this.personalTaskRepo.save({ ...data, userId });
  }

  async updatePersonalTask(id: string, userId: string, data: Partial<PersonalTaskEntity>) {
    await this.personalTaskRepo.update({ id, userId }, data);
    return this.personalTaskRepo.findOne({ where: { id, userId } });
  }

  async deletePersonalTask(id: string, userId: string) {
    return this.personalTaskRepo.delete({ id, userId });
  }

  // Today's tasks
  async getTodayTasks(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const personalTasks = await this.personalTaskRepo
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId })
      .andWhere('task.completed = false')
      .andWhere('task.dueDate >= :today AND task.dueDate < :tomorrow', { today, tomorrow })
      .orderBy('task.priority', 'DESC')
      .getMany();

    return { personalTasks };
  }

  // Projects
  async getProjects(userId: string) {
    return this.projectRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async createProject(userId: string, data: Partial<ProjectEntity>) {
    return this.projectRepo.save({ ...data, userId });
  }

  async deleteProject(id: string, userId: string) {
    await this.projectTaskRepo.delete({ projectId: id });
    return this.projectRepo.delete({ id, userId });
  }

  // Project Tasks
  async getProjectTasks(projectId: string) {
    return this.projectTaskRepo.find({ where: { projectId }, order: { createdAt: 'ASC' } });
  }

  async createProjectTask(projectId: string, data: Partial<ProjectTaskEntity>) {
    return this.projectTaskRepo.save({ ...data, projectId });
  }

  async updateProjectTask(id: string, data: Partial<ProjectTaskEntity>) {
    await this.projectTaskRepo.update(id, data);
    return this.projectTaskRepo.findOne({ where: { id } });
  }

  async deleteProjectTask(id: string) {
    return this.projectTaskRepo.delete(id);
  }
}
