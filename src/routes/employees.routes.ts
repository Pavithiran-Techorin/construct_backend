import { Router } from 'express';
import { body } from 'express-validator';
import { EmployeeController } from '../controllers/employees.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management
 *
 * /api/employees:
 *   get:
 *     summary: List all employees (with site ids)
 *     tags: [Employees]
 *     parameters:
 *       - in: query
 *         name: site_id
 *         schema: { type: integer }
 *         description: Filter by site
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Employee' }
 */
router.get('/', requireAuth, EmployeeController.getAll);

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Get employee by id
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Employee' }
 */
router.get('/:id', requireAuth, EmployeeController.getById);

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Create an employee (admin only)
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [full_name, nic, telephone, per_day_salary, site_ids]
 *             properties:
 *               full_name:      { type: string }
 *               nic:            { type: string }
 *               telephone:      { type: string }
 *               per_day_salary: { type: number }
 *               photo:          { type: string }
 *               site_ids:
 *                 type: array
 *                 items: { type: integer }
 *     responses:
 *       201: { description: Employee created }
 */
router.post('/',
  requireAdmin,
  body('full_name').trim().notEmpty(),
  body('nic').trim().notEmpty(),
  body('telephone').trim().notEmpty(),
  body('per_day_salary').isFloat({ gt: 0 }),
  body('site_ids').isArray({ min: 1 }).withMessage('At least one site is required.'),
  validate,
  EmployeeController.create,
);

/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     summary: Update an employee (admin only)
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Employee' }
 *     responses:
 *       200: { description: Updated }
 */
router.put('/:id',
  requireAdmin,
  body('full_name').trim().notEmpty(),
  body('nic').trim().notEmpty(),
  body('telephone').trim().notEmpty(),
  body('per_day_salary').isFloat({ gt: 0 }),
  body('site_ids').isArray({ min: 1 }),
  validate,
  EmployeeController.update,
);

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Delete an employee (admin only)
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deleted }
 */
router.delete('/:id', requireAdmin, EmployeeController.delete);

export default router;
