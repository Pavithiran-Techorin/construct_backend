import { Request, Response } from 'express';
import { ReportService } from '../services/reports.service';
import { handleErrorResponse } from '../utils/handleErrorResponse';
import { reportKnownErrors } from '../utils/knownError';
import { errorMessages } from '../utils/properties';
import { logger } from '../utils/logger';

export class ReportController {
  static async employeeReport(req: Request, res: Response) {
    const { employee_id, from, to, format = 'json' } = req.query;
    if (!employee_id || !from || !to) {
      logger.warn('ReportController.employeeReport - missing params', { employee_id, from, to });
      res.status(400).json({ message: errorMessages.EMPLOYEE_ID_FROM_TO_REQUIRED });
      return;
    }

    try {
      logger.debug('ReportController.employeeReport', {
        employeeId: employee_id, from, to, format, requestedBy: req.session.user?.id
      });
      const { employee, records, totals } = await ReportService.getEmployeeReport(
        parseInt(employee_id as string), from as string, to as string
      );

      if (format === 'json') {
        logger.info('Employee report generated', {
          employeeId: employee_id, from, to, format: 'json', recordCount: records.length, requestedBy: req.session.user?.id
        });
        res.json({ employee, records, totals });
        return;
      }

      if (format === 'excel') {
        logger.info('Employee report generated', {
          employeeId: employee_id, from, to, format: 'excel', recordCount: records.length, requestedBy: req.session.user?.id
        });
        await ReportService.writeEmployeeExcel(res, employee, records, from as string, to as string);
        return;
      }

      if (format === 'pdf') {
        logger.info('Employee report generated', {
          employeeId: employee_id, from, to, format: 'pdf', recordCount: records.length, requestedBy: req.session.user?.id
        });
        ReportService.writeEmployeePdf(res, employee, records, from as string, to as string);
        return;
      }

      logger.warn('ReportController.employeeReport - invalid format', { format });
      res.status(400).json({ message: errorMessages.INVALID_FORMAT });
    } catch (error) {
      handleErrorResponse(res, error, reportKnownErrors);
    }
  }

  static async monthlySummary(req: Request, res: Response) {
    const { month, format = 'json' } = req.query;
    if (!month) {
      logger.warn('ReportController.monthlySummary - missing month');
      res.status(400).json({ message: errorMessages.MONTH_REQUIRED });
      return;
    }

    try {
      logger.debug('ReportController.monthlySummary', { month, format, requestedBy: req.session.user?.id });
      const summary = await ReportService.getMonthlySummary(month as string);

      if (format === 'json') {
        logger.info('Monthly summary generated', { month, format: 'json', employeeCount: summary.records.length, requestedBy: req.session.user?.id });
        res.json({ month, records: summary.records, totals: summary.totals });
        return;
      }

      if (format === 'excel') {
        logger.info('Monthly summary generated', { month, format: 'excel', employeeCount: summary.records.length, requestedBy: req.session.user?.id });
        await ReportService.writeMonthlyExcel(res, summary.records, month as string);
        return;
      }

      if (format === 'pdf') {
        logger.info('Monthly summary generated', { month, format: 'pdf', employeeCount: summary.records.length, requestedBy: req.session.user?.id });
        ReportService.writeMonthlyPdf(res, summary.records, month as string);
        return;
      }

      logger.warn('ReportController.monthlySummary - invalid format', { format });
      res.status(400).json({ message: errorMessages.INVALID_FORMAT });
    } catch (error) {
      handleErrorResponse(res, error, reportKnownErrors);
    }
  }
}
