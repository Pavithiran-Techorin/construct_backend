import 'reflect-metadata';
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('sites')
export class Site {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200, unique: true })
  name!: string;

  @Column({ type: 'text' })
  address!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
