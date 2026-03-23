import 'reflect-metadata';
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToMany, JoinTable,
} from 'typeorm';
import { Site } from './Site';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'emp_id', unique: true })
  empId!: number;

  @Column({ name: 'full_name', length: 200 })
  fullName!: string;

  @Column({ length: 20, unique: true })
  nic!: string;

  @Column({ length: 20 })
  telephone!: string;

  @Column('decimal', { name: 'per_day_salary', precision: 10, scale: 2 })
  perDaySalary!: number;

  @Column({ type: 'text', nullable: true })
  photo!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToMany(() => Site)
  @JoinTable({
    name: 'employee_sites',
    joinColumn: { name: 'employee_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'site_id', referencedColumnName: 'id' },
  })
  sites!: Site[];
}
