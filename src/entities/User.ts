import 'reflect-metadata';
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'first_name', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', length: 100 })
  lastName!: string;

  @Column({ length: 255, unique: true })
  email!: string;

  @Column({ length: 255 })
  password!: string;

  @Column({ length: 10, default: 'user' })
  role!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
