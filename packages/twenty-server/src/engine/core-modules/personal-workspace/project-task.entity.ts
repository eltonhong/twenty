import { Field, ObjectType } from '@nestjs/graphql';
import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@Index('IDX_PROJECT_TASK_PROJECT_ID', ['projectId'])
@Entity({ name: 'projectTask', schema: 'core' })
@ObjectType('ProjectTask')
export class ProjectTaskEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  projectId: string;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field({ default: 'medium' })
  @Column({ default: 'medium' })
  priority: 'high' | 'medium' | 'low';

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  dueDate?: Date;

  @Field()
  @Column({ default: false })
  completed: boolean;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
