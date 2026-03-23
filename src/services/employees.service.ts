import { AppDataSource } from '../config/database';
import { Employee } from '../entities/Employee';
import { AppError } from '../errors/AppError';
import { errorMessages } from '../utils/properties';
import { logger } from '../utils/logger';
import { StorageService } from './storage.service';

const employeeRepo = () => AppDataSource.getRepository(Employee);

interface EmployeeData {
  full_name: string;
  nic: string;
  telephone: string;
  per_day_salary: number;
  photo?: string | null;
  site_ids: number[];
}

async function getEmployeeWithSites(id: number) {
  const rows = await AppDataSource.query(`
    SELECT e.*,
           COALESCE(
             ARRAY_AGG(es.site_id ORDER BY es.site_id) FILTER (WHERE es.site_id IS NOT NULL),
             '{}'
           ) AS site_ids
    FROM employees e
    LEFT JOIN employee_sites es ON es.employee_id = e.id
    WHERE e.id = $1
    GROUP BY e.id`, [id]);

  if (!rows.length) return null;
  const emp = rows[0];
  emp.site_ids = emp.site_ids.map(Number);
  emp.per_day_salary = parseFloat(emp.per_day_salary);
  return emp;
}

export class EmployeeService {
  static async getAll(siteId?: number) {
    logger.debug('EmployeeService.getAll', { siteId });
    let sql = `
      SELECT e.*,
             COALESCE(
               ARRAY_AGG(es.site_id ORDER BY es.site_id) FILTER (WHERE es.site_id IS NOT NULL),
               '{}'
             ) AS site_ids
      FROM employees e
      LEFT JOIN employee_sites es ON es.employee_id = e.id`;
    const params: any[] = [];

    if (siteId) {
      sql += `
      WHERE e.id IN (
        SELECT employee_id FROM employee_sites WHERE site_id = $1
      )`;
      params.push(siteId);
    }

    sql += ' GROUP BY e.id ORDER BY e.emp_id';

    const rows = await AppDataSource.query(sql, params);
    logger.debug('EmployeeService.getAll - fetched', { count: rows.length });
    return rows.map((e: any) => ({
      ...e,
      site_ids: e.site_ids.map(Number),
      per_day_salary: parseFloat(e.per_day_salary),
    }));
  }

  static async getById(id: number) {
    logger.debug('EmployeeService.getById', { employeeId: id });
    const emp = await getEmployeeWithSites(id);
    if (!emp) {
      logger.warn('EmployeeService.getById - not found', { employeeId: id });
      throw new AppError(404, errorMessages.EMPLOYEE_NOT_FOUND);
    }
    return emp;
  }

  static async create(data: EmployeeData) {
    logger.debug('EmployeeService.create', { fullName: data.full_name, nic: data.nic, siteIds: data.site_ids });
    
    if (data.photo && data.photo.startsWith('data:image')) {
      try {
        data.photo = await StorageService.uploadBase64Image(data.photo);
      } catch (err: any) {
        throw new AppError(400, err.message);
      }
    } else if (data.photo && !data.photo.startsWith('http')) {
      throw new AppError(400, 'Photo must be a valid URL or base64 data URI');
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    logger.debug('EmployeeService.create - transaction started');

    try {
      // Auto-generate emp_id
      const [{ maxId }] = await queryRunner.query(
        'SELECT COALESCE(MAX(emp_id), 1000) AS "maxId" FROM employees'
      );
      const empId = maxId + 1;

      const [inserted] = await queryRunner.query(
        `INSERT INTO employees (emp_id, full_name, nic, telephone, per_day_salary, photo)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [empId, data.full_name, data.nic, data.telephone, data.per_day_salary, data.photo || null]
      );

      const empDbId = inserted.id;
      for (const sid of data.site_ids) {
        await queryRunner.query(
          'INSERT INTO employee_sites (employee_id, site_id) VALUES ($1, $2)',
          [empDbId, sid]
        );
      }

      await queryRunner.commitTransaction();
      logger.info('EmployeeService.create - employee created', { employeeId: empDbId, empId, fullName: data.full_name });
      return await getEmployeeWithSites(empDbId);
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      logger.error('EmployeeService.create - transaction rolled back', { error: err.message, nic: data.nic });
      if (err.code === '23505' && err.detail?.includes('nic')) {
        throw new AppError(409, errorMessages.NIC_EXISTS);
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  static async update(id: number, data: EmployeeData) {
    logger.debug('EmployeeService.update', { employeeId: id, fullName: data.full_name });

    if (data.photo && data.photo.startsWith('data:image')) {
      try {
        data.photo = await StorageService.uploadBase64Image(data.photo);
      } catch (err: any) {
        throw new AppError(400, err.message);
      }
    } else if (data.photo && !data.photo.startsWith('http')) {
      throw new AppError(400, 'Photo must be a valid URL or base64 data URI');
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    logger.debug('EmployeeService.update - transaction started', { employeeId: id });

    try {
      const [existingEmployee] = await queryRunner.query('SELECT id FROM employees WHERE id = $1', [id]);
      if (!existingEmployee) {
        await queryRunner.rollbackTransaction();
        logger.warn('EmployeeService.update - not found', { employeeId: id });
        throw new AppError(404, errorMessages.EMPLOYEE_NOT_FOUND);
      }

      await queryRunner.query(
        `UPDATE employees SET full_name=$1, nic=$2, telephone=$3, per_day_salary=$4, photo=$5, updated_at=CURRENT_TIMESTAMP WHERE id=$6`,
        [data.full_name, data.nic, data.telephone, data.per_day_salary, data.photo ?? null, id]
      );

      await queryRunner.query('DELETE FROM employee_sites WHERE employee_id = $1', [id]);
      for (const sid of data.site_ids) {
        await queryRunner.query(
          'INSERT INTO employee_sites (employee_id, site_id) VALUES ($1, $2)',
          [id, sid]
        );
      }

      await queryRunner.commitTransaction();
      logger.info('EmployeeService.update - employee updated', { employeeId: id, fullName: data.full_name });
      return await getEmployeeWithSites(id);
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      logger.error('EmployeeService.update - transaction rolled back', { employeeId: id, error: err.message });
      if (err.code === '23505' && err.detail?.includes('nic')) {
        throw new AppError(409, errorMessages.NIC_EXISTS);
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  static async delete(id: number) {
    logger.debug('EmployeeService.delete', { employeeId: id });
    const result = await employeeRepo().delete(id);
    if (result.affected === 0) {
      logger.warn('EmployeeService.delete - not found', { employeeId: id });
      throw new AppError(404, errorMessages.EMPLOYEE_NOT_FOUND);
    }
    logger.info('EmployeeService.delete - employee deleted', { employeeId: id });
  }
}
