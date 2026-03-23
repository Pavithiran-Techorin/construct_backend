import { Not } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Site } from '../entities/Site';
import { AppError } from '../errors/AppError';
import { errorMessages } from '../utils/properties';
import { logger } from '../utils/logger';

const siteRepo = () => AppDataSource.getRepository(Site);

export interface SiteWithEmployeeCount {
  id: number;
  name: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  employee_count: number;
}

export class SiteService {
  static async getAll(): Promise<SiteWithEmployeeCount[]> {
    logger.debug('SiteService.getAll');
    const sites = await AppDataSource.query(`
      SELECT s.*, COUNT(DISTINCT es.employee_id)::int AS employee_count
      FROM sites s
      LEFT JOIN employee_sites es ON es.site_id = s.id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);
    
    logger.debug('SiteService.getAll - fetched', { count: sites.length });
    
    return sites.map((row: any) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      employee_count: row.employee_count,
    }));
  }

  static async getById(id: number) {
    logger.debug('SiteService.getById', { siteId: id });
    const site = await siteRepo().findOne({ where: { id } });
    if (!site) {
      logger.warn('SiteService.getById - not found', { siteId: id });
      throw new AppError(404, errorMessages.SITE_NOT_FOUND);
    }
    return site;
  }

  static async create(name: string, address: string) {
    logger.debug('SiteService.create', { name, address });
    
    // Check if site name already exists
    const existingSite = await siteRepo().findOne({ where: { name } });
    if (existingSite) {
      logger.warn('SiteService.create - name exists', { name });
      throw new AppError(409, errorMessages.SITE_NAME_EXISTS);
    }

    const site = siteRepo().create({ name, address });
    try {
      await siteRepo().save(site);
      logger.info('SiteService.create - site created', { siteId: site.id, name });
      return await siteRepo().findOne({ where: { id: site.id } });
    } catch (err: any) {
      if (err.code === '23505') {
        throw new AppError(409, errorMessages.SITE_NAME_EXISTS);
      }
      throw err;
    }
  }

  static async update(id: number, name: string, address: string) {
    logger.debug('SiteService.update', { siteId: id, name });

    // Check if another site already has this name
    const existingSite = await siteRepo().findOne({ 
      where: { 
        name: name,
        id: Not(id)
      } 
    });
    
    if (existingSite) {
      logger.warn('SiteService.update - name exists for another site', { siteId: id, name });
      throw new AppError(409, errorMessages.SITE_NAME_EXISTS);
    }

    let result;
    try {
      result = await siteRepo().update(id, { name, address });
    } catch (err: any) {
      if (err.code === '23505') {
        throw new AppError(409, errorMessages.SITE_NAME_EXISTS);
      }
      throw err;
    }

    if (result.affected === 0) {
      logger.warn('SiteService.update - not found', { siteId: id });
      throw new AppError(404, errorMessages.SITE_NOT_FOUND);
    }
    logger.info('SiteService.update - site updated', { siteId: id, name });
    return await siteRepo().findOne({ where: { id } });
  }

  static async delete(id: number) {
    logger.debug('SiteService.delete', { siteId: id });

    // Check if site has any employees
    const employeeCountResult = await AppDataSource.query(
      'SELECT COUNT(*)::int as count FROM employee_sites WHERE site_id = $1',
      [id]
    );
    
    if (employeeCountResult[0].count > 0) {
      logger.warn('SiteService.delete - site has employees', { siteId: id, employeeCount: employeeCountResult[0].count });
      throw new AppError(409, errorMessages.CANNOT_DELETE_SITE_WITH_EMPLOYEES);
    }

    const result = await siteRepo().delete(id);
    if (result.affected === 0) {
      logger.warn('SiteService.delete - not found', { siteId: id });
      throw new AppError(404, errorMessages.SITE_NOT_FOUND);
    }
    logger.info('SiteService.delete - site deleted', { siteId: id });
  }
}
