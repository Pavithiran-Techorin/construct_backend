import { Router } from 'express';
import { body, query } from 'express-validator';
import { AttendanceController } from '../controllers/attendance.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Daily attendance entry
 *
 * /api/attendance:
 *   get:
 *     summary: Get attendance records (filter by site + date)
 *     tags: [Attendance]
 *     parameters:
 *       - in: query
 *         name: site_id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: List of attendance with employee info
 */
router.get('/',
  requireAuth,
  query('site_id').notEmpty(),
  query('date').notEmpty(),
  validate,
  AttendanceController.getAttendance,
);

/**
 * @swagger
 * /api/attendance:
 *   post:
 *     summary: Submit attendance for a site on a date (upsert)
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [site_id, date, records]
 *             properties:
 *               site_id: { type: integer }
 *               date:    { type: string, format: date }
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     employee_id: { type: integer }
 *                     type:        { type: string, enum: [full, half, absent] }
 *                     ot_hours:    { type: number }
 *                     paid_amount: { type: number }
 *     responses:
 *       200: { description: Attendance saved }
 */
router.post('/',
  requireAuth,
  body('site_id').isInt({ gt: 0 }),
  body('date').isDate(),
  body('records').isArray({ min: 1 }),
  validate,
  AttendanceController.submitAttendance,
);

export default router;
