import { Router } from 'express';
import { body } from 'express-validator';
import { UserController } from '../controllers/users.controller';
import { requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: System user management (admin only)
 *
 * /api/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Users]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/User' }
 */
router.get('/', requireAdmin, UserController.getAll);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a user (admin only)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email, password, role]
 *             properties:
 *               first_name: { type: string }
 *               last_name:  { type: string }
 *               email:      { type: string }
 *               password:   { type: string, minLength: 6 }
 *               role:       { type: string, enum: [admin, user] }
 *     responses:
 *       201: { description: User created }
 */
router.post('/',
  requireAdmin,
  body('first_name').trim().notEmpty(),
  body('last_name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role').isIn(['admin', 'user']),
  validate,
  UserController.create,
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user (admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name: { type: string }
 *               last_name:  { type: string }
 *               email:      { type: string }
 *               password:   { type: string }
 *               role:       { type: string, enum: [admin, user] }
 *     responses:
 *       200: { description: Updated }
 */
router.put('/:id',
  requireAdmin,
  body('first_name').trim().notEmpty(),
  body('last_name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('role').isIn(['admin', 'user']),
  validate,
  UserController.update,
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deleted }
 */
router.delete('/:id', requireAdmin, UserController.delete);

export default router;
