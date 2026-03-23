import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { AppError } from '../errors/AppError';
import { errorMessages } from '../utils/properties';
import { logger } from '../utils/logger';

const userRepo = () => AppDataSource.getRepository(User);

export class AuthService {
  static async login(email: string, password: string) {
    logger.debug('AuthService.login - finding user', { email });
    const user = await userRepo().findOne({ where: { email } });
    if (!user) {
      logger.debug('AuthService.login - user not found', { email });
      throw new AppError(401, errorMessages.INVALID_CREDENTIALS);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      logger.debug('AuthService.login - invalid password', { email });
      throw new AppError(401, errorMessages.INVALID_CREDENTIALS);
    }

    logger.debug('AuthService.login - credentials valid', { userId: user.id });
    return {
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      role: user.role,
    };
  }
}
