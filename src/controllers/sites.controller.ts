import { Request, Response } from 'express';
import { SiteService } from '../services/sites.service';
import { handleErrorResponse } from '../utils/handleErrorResponse';
import { siteKnownErrors } from '../utils/knownError';
import { logger } from '../utils/logger';
import { successMessages } from '../utils/properties';

export class SiteController {
  static async getAll(req: Request, res: Response) {
    try {
      logger.debug('SiteController.getAll', { requestedBy: req.session.user?.id });
      const sites = await SiteService.getAll();
      logger.info('Sites fetched', { count: sites.length, requestedBy: req.session.user?.id });
      res.json(sites);
    } catch (error) {
      handleErrorResponse(res, error, siteKnownErrors);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      logger.debug('SiteController.getById', { siteId: id, requestedBy: req.session.user?.id });
      const site = await SiteService.getById(id);
      res.json(site);
    } catch (error) {
      handleErrorResponse(res, error, siteKnownErrors);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { name, address } = req.body;
      logger.debug('SiteController.create', { name, requestedBy: req.session.user?.id });
      const site = await SiteService.create(name, address);
      logger.info('Site created', { siteId: site?.id, name, createdBy: req.session.user?.id });
      res.status(201).json(site);
    } catch (error) {
      handleErrorResponse(res, error, siteKnownErrors);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const { name, address } = req.body;
      logger.debug('SiteController.update', { siteId: id, name, requestedBy: req.session.user?.id });
      const site = await SiteService.update(id, name, address);
      logger.info('Site updated', { siteId: id, name, updatedBy: req.session.user?.id });
      res.json(site);
    } catch (error) {
      handleErrorResponse(res, error, siteKnownErrors);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      logger.debug('SiteController.delete', { siteId: id, requestedBy: req.session.user?.id });
      await SiteService.delete(id);
      logger.info('Site deleted', { siteId: id, deletedBy: req.session.user?.id });
      res.json({ message: successMessages.SITE_DELETED });
    } catch (error) {
      handleErrorResponse(res, error, siteKnownErrors);
    }
  }
}
