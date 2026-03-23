import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Site } from '../entities/Site';
import { Employee } from '../entities/Employee';
import { Attendance } from '../entities/Attendance';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  database: process.env.POSTGRES_DB || 'construction_db',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Site, Employee, Attendance],
  subscribers: [],
  migrations: [__dirname + '/../migrations/*.{ts,js}'],
  migrationsTableName: 'migrations',
});
