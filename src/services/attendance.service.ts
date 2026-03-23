import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';
import { PayrollCalculator } from '../utils/PayrollCalculator';

interface AttendanceRecord {
  employee_id: number;
  type: string;
  ot_hours: number;
  paid_amount: number;
}

export class AttendanceService {
  static async getAttendance(siteId: number, date: string) {
    logger.debug('AttendanceService.getAttendance', { siteId, date });
    const employees = await AppDataSource.query(`
      SELECT e.id, e.emp_id, e.full_name, e.per_day_salary, e.photo,
             a.id AS att_id, a.type, a.ot_hours, a.paid_amount, a.balance_amount,
             pb.previous_balance_amount
      FROM employees e
      INNER JOIN employee_sites es ON es.employee_id = e.id AND es.site_id = $1
      LEFT JOIN attendance a ON a.employee_id = e.id AND a.site_id = $1 AND a.date = $2
      LEFT JOIN LATERAL (
        SELECT COALESCE(SUM(prev.balance_amount), 0)::float AS previous_balance_amount
        FROM attendance prev
        -- Sum balance tracking the employee's total outstanding amount across all sites
        WHERE prev.employee_id = e.id AND prev.date < $2
      ) pb ON true
      ORDER BY e.emp_id`, [siteId, date]);

    logger.debug('AttendanceService.getAttendance - fetched', { siteId, date, count: employees.length });
    return employees.map((e: any) => ({
      id: e.id,
      emp_id: e.emp_id,
      full_name: e.full_name,
      per_day_salary: parseFloat(e.per_day_salary),
      photo: e.photo,
      att_id: e.att_id,
      type: e.type || 'full',
      ot_hours: parseFloat(e.ot_hours) || 0,
      paid_amount: parseFloat(e.paid_amount) || 0,
      balance_amount: parseFloat(e.balance_amount) || 0,
      previous_balance_amount: e.previous_balance_amount || 0,
    }));
  }

  static async submitAttendance(siteId: number, date: string, records: AttendanceRecord[], userId: number) {
    logger.debug('AttendanceService.submitAttendance', { siteId, date, recordCount: records.length, userId });
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    logger.debug('AttendanceService.submitAttendance - transaction started', { siteId, date });

    try {
      // Fetch salaries in one go
      const employeeIds = records.map(r => r.employee_id);
      const employees = await queryRunner.query('SELECT id, per_day_salary FROM employees WHERE id = ANY($1)', [employeeIds]);
      const salaryMap = new Map<number, number>(employees.map((e: any) => [e.id, parseFloat(e.per_day_salary)]));

      for (const rec of records) {
        const salary = salaryMap.get(rec.employee_id) || 0;
        const payable = PayrollCalculator.calculateDailyPayable(salary, rec.type, rec.ot_hours || 0);
        const balance = payable - (rec.paid_amount || 0);

        await queryRunner.query(`
          INSERT INTO attendance (employee_id, site_id, date, type, ot_hours, paid_amount, balance_amount, created_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (employee_id, site_id, date) DO UPDATE SET
            type = EXCLUDED.type,
            ot_hours = EXCLUDED.ot_hours,
            paid_amount = EXCLUDED.paid_amount,
            balance_amount = EXCLUDED.balance_amount,
            updated_at = CURRENT_TIMESTAMP`,
          [rec.employee_id, siteId, date, rec.type, rec.ot_hours || 0, rec.paid_amount || 0, balance, userId]
        );
      }

      await queryRunner.commitTransaction();
      logger.info('AttendanceService.submitAttendance - committed', { siteId, date, recordCount: records.length, userId });
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      logger.error('AttendanceService.submitAttendance - transaction rolled back', {
        siteId, date, recordCount: records.length, userId, error: err.message
      });
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
