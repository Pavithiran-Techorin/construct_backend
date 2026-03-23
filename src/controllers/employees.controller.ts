import { Request, Response } from 'express';
import { EmployeeService } from '../services/employees.service';
import { handleErrorResponse } from '../utils/handleErrorResponse';
import { employeeKnownErrors } from '../utils/knownError';
import { logger } from '../utils/logger';
import { successMessages } from '../utils/properties';

export class EmployeeController {
  static async getAll(req: Request, res: Response) {
    try {
      const siteId = req.query.site_id ? parseInt(req.query.site_id as string) : undefined;
      logger.debug('EmployeeController.getAll', { siteId, requestedBy: req.session.user?.id });
      const employees = await EmployeeService.getAll(siteId);
      logger.info('Employees fetched', { count: employees.length, siteId, requestedBy: req.session.user?.id });
      res.json(employees);
    } catch (error) {
      handleErrorResponse(res, error, employeeKnownErrors);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      logger.debug('EmployeeController.getById', { employeeId: id, requestedBy: req.session.user?.id });
      const employee = await EmployeeService.getById(id);
      res.json(employee);
    } catch (error) {
      handleErrorResponse(res, error, employeeKnownErrors);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { full_name, nic, site_ids } = req.body;
      logger.debug('EmployeeController.create', { fullName: full_name, nic, siteIds: site_ids, requestedBy: req.session.user?.id });
      const employee = await EmployeeService.create(req.body);
      logger.info('Employee created', { employeeId: employee.id, empId: employee.emp_id, fullName: full_name, createdBy: req.session.user?.id });
      res.status(201).json(employee);
    } catch (error) {
      handleErrorResponse(res, error, employeeKnownErrors);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const { full_name } = req.body;
      logger.debug('EmployeeController.update', { employeeId: id, fullName: full_name, requestedBy: req.session.user?.id });
      const employee = await EmployeeService.update(id, req.body);
      logger.info('Employee updated', { employeeId: id, fullName: full_name, updatedBy: req.session.user?.id });
      res.json(employee);
    } catch (error) {
      handleErrorResponse(res, error, employeeKnownErrors);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      logger.debug('EmployeeController.delete', { employeeId: id, requestedBy: req.session.user?.id });
      await EmployeeService.delete(id);
      logger.info('Employee deleted', { employeeId: id, deletedBy: req.session.user?.id });
      res.json({ message: successMessages.EMPLOYEE_DELETED });
    } catch (error) {
      handleErrorResponse(res, error, employeeKnownErrors);
    }
  }
}
