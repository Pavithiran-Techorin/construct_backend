import { Request, Response } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { handleErrorResponse } from '../utils/handleErrorResponse';
import { attendanceKnownErrors } from '../utils/knownError';
import { successMessages } from '../utils/properties';
import { logger } from '../utils/logger';

export class AttendanceController {
  static async getAttendance(req: Request, res: Response) {
    try {
      const siteId = parseInt(req.query.site_id as string);
      const date = req.query.date as string;
      logger.debug('AttendanceController.getAttendance', { siteId, date, requestedBy: req.session.user?.id });
      const records = await AttendanceService.getAttendance(siteId, date);
      logger.info('Attendance fetched', { siteId, date, recordCount: records.length, requestedBy: req.session.user?.id });
      res.json(records);
    } catch (error) {
      handleErrorResponse(res, error, attendanceKnownErrors);
    }
  }

  static async submitAttendance(req: Request, res: Response) {
    try {
      const { site_id, date, records } = req.body;
      const userId = req.session.user!.id;
      logger.debug('AttendanceController.submitAttendance', { siteId: site_id, date, recordCount: records?.length, userId });
      await AttendanceService.submitAttendance(site_id, date, records, userId);
      logger.info('Attendance submitted', { siteId: site_id, date, recordCount: records?.length, submittedBy: userId });
      res.json({ message: successMessages.ATTENDANCE_SAVED });
    } catch (error) {
      handleErrorResponse(res, error, attendanceKnownErrors);
    }
  }
}
