import { Router } from 'express';
import { body } from 'express-validator';
import { SiteController } from '../controllers/sites.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Sites
 *   description: Construction site management
 *
 * /api/sites:
 *   get:
 *     summary: List all sites
 *     tags: [Sites]
 *     responses:
 *       200:
 *         description: Array of sites
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Site' }
 */
router.get('/', requireAuth, SiteController.getAll);

/**
 * @swagger
 * /api/sites/{id}:
 *   get:
 *     summary: Get a single site
 *     tags: [Sites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Site' }
 *       404: { description: Not found }
 */
router.get('/:id', requireAuth, SiteController.getById);

/**
 * @swagger
 * /api/sites:
 *   post:
 *     summary: Create a site (admin only)
 *     tags: [Sites]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address]
 *             properties:
 *               name:    { type: string }
 *               address: { type: string }
 *     responses:
 *       201: { description: Site created }
 */
router.post('/',
  requireAdmin,
  body('name').trim().notEmpty(),
  body('address').trim().notEmpty(),
  validate,
  SiteController.create,
);

/**
 * @swagger
 * /api/sites/{id}:
 *   put:
 *     summary: Update a site (admin only)
 *     tags: [Sites]
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
 *               name:    { type: string }
 *               address: { type: string }
 *     responses:
 *       200: { description: Site updated }
 */
router.put('/:id',
  requireAdmin,
  body('name').trim().notEmpty(),
  body('address').trim().notEmpty(),
  validate,
  SiteController.update,
);

/**
 * @swagger
 * /api/sites/{id}:
 *   delete:
 *     summary: Delete a site (admin only)
 *     tags: [Sites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deleted }
 */
router.delete('/:id', requireAdmin, SiteController.delete);

export default router;
