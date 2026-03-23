import { Request, Response } from 'express';
import { UserService } from '../services/users.service';
import { handleErrorResponse } from '../utils/handleErrorResponse';
import { userKnownErrors } from '../utils/knownError';
import { successMessages } from '../utils/properties';
import { logger } from '../utils/logger';

export class UserController {
  static async getAll(req: Request, res: Response) {
    try {
      logger.debug('UserController.getAll', { requestedBy: req.session.user?.id });
      const users = await UserService.getAll();
      logger.info('Users fetched', { count: users.length, requestedBy: req.session.user?.id });
      res.json(users);
    } catch (error) {
      handleErrorResponse(res, error, userKnownErrors);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { email, role } = req.body;
      logger.debug('UserController.create', { email, role, requestedBy: req.session.user?.id });
      const user = await UserService.create(req.body);
      logger.info('User created', { userId: user.id, email, role, createdBy: req.session.user?.id });
      res.status(201).json(user);
    } catch (error) {
      handleErrorResponse(res, error, userKnownErrors);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      logger.debug('UserController.update', { userId: id, requestedBy: req.session.user?.id });
      const user = await UserService.update(id, req.body);
      logger.info('User updated', { userId: id, email: user.email, updatedBy: req.session.user?.id });
      res.json(user);
    } catch (error) {
      handleErrorResponse(res, error, userKnownErrors);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      logger.debug('UserController.delete', { userId: id, requestedBy: req.session.user?.id });
      await UserService.delete(id);
      logger.info('User deleted', { userId: id, deletedBy: req.session.user?.id });
      res.json({ message: successMessages.USER_DELETED });
    } catch (error) {
      handleErrorResponse(res, error, userKnownErrors);
    }
  }
}
