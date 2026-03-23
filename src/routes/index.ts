import { Router } from 'express';
import authRoutes from './auth.routes';
import sitesRoutes from './sites.routes';
import employeesRoutes from './employees.routes';
import attendanceRoutes from './attendance.routes';
import reportsRoutes from './reports.routes';
import usersRoutes from './users.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/sites', sitesRoutes);
router.use('/employees', employeesRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/reports', reportsRoutes);
router.use('/users', usersRoutes);

export default router;
