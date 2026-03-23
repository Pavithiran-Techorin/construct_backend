import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { AppError } from '../errors/AppError';
import { errorMessages } from '../utils/properties';
import { logger } from '../utils/logger';

const userRepo = () => AppDataSource.getRepository(User);

export class UserService {
  static async getAll() {
    logger.debug('UserService.getAll - fetching users');
    const users = await AppDataSource.query(
      'SELECT id, first_name, last_name, email, role, created_at FROM users ORDER BY id'
    );
    logger.debug('UserService.getAll - fetched', { count: users.length });
    return users;
  }

  static async create(data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: string;
  }) {
    logger.debug('UserService.create', { email: data.email, role: data.role });
    const hash = await bcrypt.hash(data.password, 10);
    try {
      const [inserted] = await AppDataSource.query(
        `INSERT INTO users (first_name, last_name, email, password, role)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [data.first_name, data.last_name, data.email, hash, data.role]
      );
      const [user] = await AppDataSource.query(
        'SELECT id, first_name, last_name, email, role, created_at FROM users WHERE id = $1',
        [inserted.id]
      );
      logger.info('UserService.create - user created', { userId: user.id, email: user.email });
      return user;
    } catch (err: any) {
      if (err.code === '23505') {
        logger.warn('UserService.create - email exists', { email: data.email });
        throw new AppError(409, errorMessages.EMAIL_EXISTS);
      }
      logger.error('UserService.create - database error', { error: err.message, email: data.email });
      throw err;
    }
  }

  static async update(id: number, data: {
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    role: string;
  }) {
    logger.debug('UserService.update', { userId: id, email: data.email });
    try {
      const [existingUser] = await AppDataSource.query('SELECT id FROM users WHERE id = $1', [id]);
      if (!existingUser) {
        logger.warn('UserService.update - user not found', { userId: id });
        throw new AppError(404, errorMessages.USER_NOT_FOUND);
      }

      if (data.password) {
        const hash = await bcrypt.hash(data.password, 10);
        await AppDataSource.query(
          'UPDATE users SET first_name=$1, last_name=$2, email=$3, password=$4, role=$5, updated_at=CURRENT_TIMESTAMP WHERE id=$6',
          [data.first_name, data.last_name, data.email, hash, data.role, id]
        );
      } else {
        await AppDataSource.query(
          'UPDATE users SET first_name=$1, last_name=$2, email=$3, role=$4, updated_at=CURRENT_TIMESTAMP WHERE id=$5',
          [data.first_name, data.last_name, data.email, data.role, id]
        );
      }

      const [user] = await AppDataSource.query(
        'SELECT id, first_name, last_name, email, role, created_at FROM users WHERE id = $1',
        [id]
      );
      logger.info('UserService.update - user updated', { userId: id, email: user.email });
      return user;
    } catch (err: any) {
      if (err.code === '23505') {
        logger.warn('UserService.update - email in use', { userId: id, email: data.email });
        throw new AppError(409, errorMessages.EMAIL_IN_USE);
      }
      throw err;
    }
  }

  static async delete(id: number) {
    logger.debug('UserService.delete', { userId: id });
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@constructsite.com';
    const [adminUser] = await AppDataSource.query(
      'SELECT id FROM users WHERE email = $1', [adminEmail]
    );

    if (adminUser && id === adminUser.id) {
      logger.warn('UserService.delete - attempt to delete default admin', { userId: id, email: adminEmail });
      throw new AppError(403, errorMessages.CANNOT_DELETE_DEFAULT_ADMIN);
    }
    const result = await userRepo().delete(id);
    if (result.affected === 0) {
      logger.warn('UserService.delete - user not found', { userId: id });
      throw new AppError(404, errorMessages.USER_NOT_FOUND);
    }
    logger.info('UserService.delete - user deleted', { userId: id });
  }
}
