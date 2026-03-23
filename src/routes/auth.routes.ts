import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20,
  message: { message: 'Too many login attempts, please try again after 15 minutes.' }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and create session
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post('/login',
  loginLimiter,
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
  AuthController.login,
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Destroy session
 *     tags: [Auth]
 *     responses:
 *       200: { description: Logged out }
 */
router.post('/logout', requireAuth, AuthController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current session user
 *     tags: [Auth]
 *     responses:
 *       200: { description: Current user }
 *       401: { description: Not authenticated }
 */
router.get('/me', requireAuth, AuthController.getMe);

export default router;
