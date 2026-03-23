import { Router } from 'express';
import { ReportController } from '../controllers/reports.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/reports/employee:
 *   get:
 *     summary: Attendance + payment report for one employee over a date range
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: employee_id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: from
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, pdf, excel] }
 *     responses:
 *       200: { description: Report data or file }
 */
router.get('/employee', requireAuth, ReportController.employeeReport);

/**
 * @swagger
 * /api/reports/monthly:
 *   get:
 *     summary: Monthly attendance summary for all employees
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema: { type: string, example: '2024-03' }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, pdf, excel] }
 *     responses:
 *       200: { description: Monthly summary data or file }
 */
router.get('/monthly', requireAuth, ReportController.monthlySummary);

export default router;
