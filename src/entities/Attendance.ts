import 'reflect-metadata';
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Employee } from './Employee';
import { Site } from './Site';
import { User } from './User';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'employee_id' })
  employeeId!: number;

  @Column({ name: 'site_id' })
  siteId!: number;

  @Column({ type: 'date' })
  date!: string;

  @Column({ length: 10, default: 'full' })
  type!: string;

  @Column('decimal', { name: 'ot_hours', precision: 4, scale: 2, default: 0 })
  otHours!: number;

  @Column('decimal', { name: 'paid_amount', precision: 10, scale: 2, default: 0 })
  paidAmount!: number;

  @Column('decimal', { name: 'balance_amount', precision: 10, scale: 2, default: 0 })
  balanceAmount!: number;

  @Column({ name: 'created_by', nullable: true })
  createdBy!: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @ManyToOne(() => Site, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'site_id' })
  site!: Site;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator!: User;
}
