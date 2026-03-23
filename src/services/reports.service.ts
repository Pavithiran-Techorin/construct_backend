import { Response } from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { AppDataSource } from '../config/database';
import { AppError } from '../errors/AppError';
import { errorMessages } from '../utils/properties';
import { logger } from '../utils/logger';
import { PayrollCalculator } from '../utils/PayrollCalculator';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtLKR = (n: number) =>
  'LKR ' + (n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// ─── Brand colors ────────────────────────────────────────────────────────────
const BRAND = {
  primary: '#F97316',       // Orange
  primaryDark: '#EA580C',
  dark: '#0C0E14',
  surface: '#13151E',
  surfaceLight: '#1A1D2A',
  text: '#E2E8F0',
  textMuted: '#94A3B8',
  accent: '#FBBF24',        // Amber
  white: '#FFFFFF',
  success: '#34D399',
  border: '#2D3045',
};

// ─── PDF Utilities ───────────────────────────────────────────────────────────
function drawPdfHeader(doc: PDFKit.PDFDocument, title: string, subtitle: string) {
  // Top accent bar
  doc.save();
  doc.rect(0, 0, doc.page.width, 4).fill(BRAND.primary);
  doc.restore();

  // Header background
  doc.save();
  doc.rect(0, 4, doc.page.width, 70).fill(BRAND.dark);
  doc.restore();

  // Logo text
  doc.fontSize(22).fillColor(BRAND.primary).font('Helvetica-Bold')
    .text('⚡ CONSTRUCTSITE', 40, 18, { continued: false });

  // Title
  doc.fontSize(10).fillColor(BRAND.textMuted).font('Helvetica')
    .text(title, 40, 48);

  // Subtitle
  doc.fontSize(8).fillColor(BRAND.textMuted).font('Helvetica')
    .text(subtitle, 40, 60);

  // Date stamp on right
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  doc.fontSize(8).fillColor(BRAND.textMuted)
    .text(`Generated: ${dateStr}`, doc.page.width - 200, 48, { width: 160, align: 'right' });

  doc.y = 90;
}

function drawTableHeader(doc: PDFKit.PDFDocument, headers: string[], cols: number[], y: number) {
  let x = 40;
  // Header row background
  doc.save();
  doc.rect(38, y - 4, cols.reduce((a, b) => a + b, 0) + 4, 22)
    .fill(BRAND.primary);
  doc.restore();

  doc.fontSize(8).fillColor(BRAND.white).font('Helvetica-Bold');
  headers.forEach((h, i) => {
    doc.text(h, x, y, { width: cols[i], align: 'left' });
    x += cols[i];
  });

  return y + 22;
}

function drawTableRow(doc: PDFKit.PDFDocument, values: string[], cols: number[], y: number, isAlt: boolean) {
  let x = 40;

  if (isAlt) {
    doc.save();
    doc.rect(38, y - 3, cols.reduce((a, b) => a + b, 0) + 4, 18)
      .fill('#F9F9FB');
    doc.restore();
  }

  doc.fontSize(7.5).fillColor('#333333').font('Helvetica');
  values.forEach((v, i) => {
    doc.text(v, x, y, { width: cols[i], align: 'left' });
    x += cols[i];
  });

  return y + 18;
}

function drawTotalRow(doc: PDFKit.PDFDocument, values: string[], cols: number[], y: number) {
  let x = 40;
  // Total row background
  doc.save();
  doc.rect(38, y - 3, cols.reduce((a, b) => a + b, 0) + 4, 22)
    .fill(BRAND.surfaceLight);
  doc.restore();

  doc.fontSize(8).fillColor(BRAND.primary).font('Helvetica-Bold');
  values.forEach((v, i) => {
    doc.text(v, x, y, { width: cols[i], align: 'left' });
    x += cols[i];
  });

  return y + 22;
}

function drawPdfFooter(doc: PDFKit.PDFDocument) {
  const bottom = doc.page.height - 30;
  // Footer line
  doc.save();
  doc.moveTo(40, bottom - 10)
    .lineTo(doc.page.width - 40, bottom - 10)
    .strokeColor(BRAND.border).lineWidth(0.5).stroke();
  doc.restore();

  doc.fontSize(7).fillColor(BRAND.textMuted).font('Helvetica')
    .text('ConstructSite — Attendance & Payments Management System', 40, bottom - 5, {
      width: doc.page.width - 80,
      align: 'center',
    });
}

// ─── Service ─────────────────────────────────────────────────────────────────
export class ReportService {
  static async getEmployeeReport(employeeId: number, from: string, to: string) {
    logger.debug('ReportService.getEmployeeReport', { employeeId, from, to });
    const [emp] = await AppDataSource.query('SELECT * FROM employees WHERE id = $1', [employeeId]);
    if (!emp) {
      logger.warn('ReportService.getEmployeeReport - employee not found', { employeeId });
      throw new AppError(404, errorMessages.EMPLOYEE_NOT_FOUND);
    }

    const records = await AppDataSource.query(`
      SELECT a.*, TO_CHAR(a.date, 'YYYY-MM-DD') AS date, s.name AS site_name
      FROM attendance a
      JOIN sites s ON s.id = a.site_id
      WHERE a.employee_id = $1 AND a.date BETWEEN $2 AND $3
      ORDER BY a.date ASC`, [employeeId, from, to]);

    const salary = parseFloat(emp.per_day_salary);
    const enriched = records.map((r: any) => ({
      ...r,
      ot_hours: parseFloat(r.ot_hours),
      paid_amount: parseFloat(r.paid_amount),
      balance_amount: parseFloat(r.balance_amount) || 0,
      payable: PayrollCalculator.calculateDailyPayable(salary, r.type, parseFloat(r.ot_hours)),
    }));

    logger.debug('ReportService.getEmployeeReport - data retrieved', { employeeId, recordCount: enriched.length });
    return {
      employee: { ...emp, per_day_salary: salary },
      records: enriched,
      totals: {
        days: enriched.length,
        total_ot: enriched.reduce((s: number, r: any) => s + r.ot_hours, 0),
        payable: enriched.reduce((s: number, r: any) => s + r.payable, 0),
        paid: enriched.reduce((s: number, r: any) => s + r.paid_amount, 0),
        balance: enriched.reduce((s: number, r: any) => s + (r.payable - r.paid_amount), 0),
      },
    };
  }

  static async writeEmployeeExcel(res: Response, emp: any, enriched: any[], from: string, to: string) {
    logger.debug('ReportService.writeEmployeeExcel', { employeeId: emp.id, empId: emp.emp_id });
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Employee Report');

    // Title
    ws.mergeCells('A1:G1');
    ws.getCell('A1').value = `Employee Report — ${emp.full_name} (${from} to ${to})`;
    ws.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFF97316' } };

    ws.addRow([]);
    const hRow = ws.addRow(['Date', 'Site', 'Attendance', 'OT Hours', 'Total Payable', 'Paid Amount', 'Balance']);
    hRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF97316' } };

    enriched.forEach((r: any) => {
      const balance = r.payable - r.paid_amount;
      ws.addRow([
        r.date, r.site_name, r.type,
        r.ot_hours,
        r.payable.toFixed(2),
        r.paid_amount.toFixed(2),
        balance.toFixed(2),
      ]);
    });

    // Totals
    const t = enriched.reduce((acc: any, r: any) => {
      acc.ot += r.ot_hours;
      acc.payable += r.payable;
      acc.paid += r.paid_amount;
      return acc;
    }, { ot: 0, payable: 0, paid: 0 });

    const totRow = ws.addRow(['', `TOTAL (${enriched.length} days)`, '', t.ot.toFixed(2),
      t.payable.toFixed(2), t.paid.toFixed(2), (t.payable - t.paid).toFixed(2)]);
    totRow.font = { bold: true, color: { argb: 'FFF97316' } };

    ws.columns.forEach(c => { c.width = 18; });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="employee_report_${emp.emp_id}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  }

  static writeEmployeePdf(res: Response, emp: any, enriched: any[], from: string, to: string) {
    logger.debug('ReportService.writeEmployeePdf', { employeeId: emp.id, empId: emp.emp_id });
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="employee_report_${emp.emp_id}.pdf"`);
    doc.pipe(res);

    // Header
    drawPdfHeader(doc, 'Employee Attendance & Payment Report',
      `Employee: ${emp.full_name}  |  ID: #${emp.emp_id}  |  Salary: ${fmtLKR(emp.per_day_salary)}/day  |  Period: ${from} to ${to}`);

    // Summary box
    const summaryY = doc.y + 5;
    doc.save();
    doc.roundedRect(38, summaryY, 360, 50, 6).fill('#FFFBEB');
    doc.restore();

    const totals = enriched.reduce((acc: any, r: any) => {
      acc.payable += r.payable; acc.paid += r.paid_amount;
      return acc;
    }, { payable: 0, paid: 0 });

    doc.fontSize(8).fillColor('#92400E').font('Helvetica-Bold')
      .text(`Total Days: ${enriched.length}`, 50, summaryY + 10)
      .text(`Total Payable: ${fmtLKR(totals.payable)}`, 50, summaryY + 24)
      .text(`Total Paid: ${fmtLKR(totals.paid)}`, 200, summaryY + 10)
      .text(`Balance: ${fmtLKR(totals.payable - totals.paid)}`, 200, summaryY + 24);

    doc.y = summaryY + 65;

    // Table
    const cols = [90, 150, 70, 60, 100, 100, 100];
    const headers = ['Date', 'Site', 'Type', 'OT Hrs', 'Payable', 'Paid', 'Balance'];
    let y = drawTableHeader(doc, headers, cols, doc.y);

    enriched.forEach((r: any, idx: number) => {
      if (y > doc.page.height - 60) {
        drawPdfFooter(doc);
        doc.addPage();
        drawPdfHeader(doc, 'Employee Report (continued)', `${emp.full_name} — ${from} to ${to}`);
        y = drawTableHeader(doc, headers, cols, doc.y);
      }
      y = drawTableRow(doc, [
        r.date, r.site_name, r.type, (r.ot_hours as number).toFixed(1),
        fmtLKR(r.payable), fmtLKR(r.paid_amount), fmtLKR(r.payable - r.paid_amount),
      ], cols, y, idx % 2 === 1);
    });

    // Total row
    const t = enriched.reduce((a: any, r: any) => {
      a.ot += r.ot_hours; a.payable += r.payable; a.paid += r.paid_amount;
      return a;
    }, { ot: 0, payable: 0, paid: 0 });

    y += 4;
    drawTotalRow(doc, [
      '', `TOTAL (${enriched.length} days)`, '', t.ot.toFixed(1),
      fmtLKR(t.payable), fmtLKR(t.paid), fmtLKR(t.payable - t.paid),
    ], cols, y);

    drawPdfFooter(doc);
    doc.end();
  }

  // ─── Monthly summary ──────────────────────────────────────────────────────
  static async getMonthlySummary(month: string) {
    logger.debug('ReportService.getMonthlySummary', { month });
    const rows = await AppDataSource.query(`
      SELECT
        e.id, e.emp_id, e.full_name, e.per_day_salary,
        SUM(CASE WHEN a.type = 'full'   THEN 1 ELSE 0 END)::int AS full_days,
        SUM(CASE WHEN a.type = 'half'   THEN 1 ELSE 0 END)::int AS half_days,
        SUM(CASE WHEN a.type = 'absent' THEN 1 ELSE 0 END)::int AS absent_days,
        SUM(a.ot_hours)    AS total_ot,
        SUM(a.paid_amount) AS total_paid
      FROM employees e
      LEFT JOIN attendance a ON a.employee_id = e.id AND TO_CHAR(a.date, 'YYYY-MM') = $1
      GROUP BY e.id
      HAVING SUM(CASE WHEN a.type IN ('full','half','absent') THEN 1 ELSE 0 END) > 0
      ORDER BY e.emp_id`, [month]);

    logger.debug('ReportService.getMonthlySummary - data retrieved', { month, employeeCount: rows.length });
    const records = rows.map((r: any) => {
      const salary = parseFloat(r.per_day_salary);
      const totalOt = parseFloat(r.total_ot) || 0;
      const totalPaid = parseFloat(r.total_paid) || 0;

      const totalPayable = PayrollCalculator.calculateAggregatePayable(
        salary,
        r.full_days || 0,
        r.half_days || 0,
        totalOt
      );

      return {
        id: r.id,
        emp_id: r.emp_id,
        full_name: r.full_name,
        per_day_salary: salary,
        full_days: r.full_days || 0,
        half_days: r.half_days || 0,
        absent_days: r.absent_days || 0,
        work_days: (r.full_days || 0) + (r.half_days || 0),
        total_ot: totalOt,
        total_paid: totalPaid,
        total_payable: totalPayable,
        balance: totalPayable - totalPaid,
      };
    });

    const totals = {
      full_days: records.reduce((s: number, r: any) => s + r.full_days, 0),
      half_days: records.reduce((s: number, r: any) => s + r.half_days, 0),
      work_days: records.reduce((s: number, r: any) => s + r.work_days, 0),
      total_ot: records.reduce((s: number, r: any) => s + r.total_ot, 0),
      total_payable: records.reduce((s: number, r: any) => s + r.total_payable, 0),
      total_paid: records.reduce((s: number, r: any) => s + r.total_paid, 0),
      balance: records.reduce((s: number, r: any) => s + r.balance, 0),
    };

    return { records, totals };
  }

  static async writeMonthlyExcel(res: Response, data: any[], month: string) {
    logger.debug('ReportService.writeMonthlyExcel', { month, employeeCount: data.length });
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Monthly Summary');

    ws.mergeCells('A1:I1');
    ws.getCell('A1').value = `Monthly Summary — ${month}`;
    ws.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFF97316' } };
    ws.addRow([]);

    const hdrs = ['Emp ID', 'Name', 'Full Days', 'Half Days', 'Work Days', 'OT Hours', 'Total Payable', 'Total Paid', 'Balance'];
    const hRow = ws.addRow(hdrs);
    hRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF97316' } };

    data.forEach(r => {
      ws.addRow([r.emp_id, r.full_name, r.full_days, r.half_days, r.work_days,
        r.total_ot.toFixed(2), r.total_payable.toFixed(2), r.total_paid.toFixed(2), r.balance.toFixed(2)]);
    });

    const t = data.reduce((a, r) => {
      a.full += r.full_days; a.half += r.half_days; a.work += r.work_days;
      a.ot += r.total_ot; a.pay += r.total_payable; a.paid += r.total_paid; a.bal += r.balance;
      return a;
    }, { full: 0, half: 0, work: 0, ot: 0, pay: 0, paid: 0, bal: 0 });

    const tRow = ws.addRow(['', 'TOTALS', t.full, t.half, t.work,
      t.ot.toFixed(2), t.pay.toFixed(2), t.paid.toFixed(2), t.bal.toFixed(2)]);
    tRow.font = { bold: true, color: { argb: 'FFF97316' } };

    ws.columns.forEach(c => { c.width = 16; });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="monthly_report_${month}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  }

  static writeMonthlyPdf(res: Response, data: any[], month: string) {
    logger.debug('ReportService.writeMonthlyPdf', { month, employeeCount: data.length });
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="monthly_report_${month}.pdf"`);
    doc.pipe(res);

    // Header
    drawPdfHeader(doc, `Monthly Attendance Summary — ${month}`,
      `Generated for all employees with attendance records in ${month}`);

    // Summary stats
    const grandTotals = data.reduce((a, r) => {
      a.payable += r.total_payable; a.paid += r.total_paid;
      a.employees++; a.workDays += r.work_days;
      return a;
    }, { payable: 0, paid: 0, employees: 0, workDays: 0 });

    const summaryY = doc.y + 5;
    doc.save();
    doc.roundedRect(38, summaryY, 500, 45, 6).fill('#FFFBEB');
    doc.restore();

    doc.fontSize(8).fillColor('#92400E').font('Helvetica-Bold')
      .text(`Employees: ${grandTotals.employees}`, 50, summaryY + 10)
      .text(`Total Work Days: ${grandTotals.workDays}`, 170, summaryY + 10)
      .text(`Total Payable: ${fmtLKR(grandTotals.payable)}`, 310, summaryY + 10)
      .text(`Total Paid: ${fmtLKR(grandTotals.paid)}`, 50, summaryY + 26)
      .text(`Outstanding Balance: ${fmtLKR(grandTotals.payable - grandTotals.paid)}`, 170, summaryY + 26);

    doc.y = summaryY + 60;

    // Table
    const cols = [55, 130, 60, 60, 65, 65, 90, 90, 90];
    const headers = ['Emp ID', 'Name', 'Full', 'Half', 'Days', 'OT Hrs', 'Payable', 'Paid', 'Balance'];
    let y = drawTableHeader(doc, headers, cols, doc.y);

    data.forEach((r, idx) => {
      if (y > doc.page.height - 60) {
        drawPdfFooter(doc);
        doc.addPage();
        drawPdfHeader(doc, `Monthly Summary — ${month} (continued)`, '');
        y = drawTableHeader(doc, headers, cols, doc.y);
      }
      y = drawTableRow(doc, [
        String(r.emp_id), r.full_name, String(r.full_days), String(r.half_days),
        String(r.work_days), r.total_ot.toFixed(1),
        fmtLKR(r.total_payable), fmtLKR(r.total_paid), fmtLKR(r.balance),
      ], cols, y, idx % 2 === 1);
    });

    // Total row
    const t = data.reduce((a, r) => {
      a.full += r.full_days; a.half += r.half_days; a.work += r.work_days;
      a.ot += r.total_ot; a.pay += r.total_payable; a.paid += r.total_paid; a.bal += r.balance;
      return a;
    }, { full: 0, half: 0, work: 0, ot: 0, pay: 0, paid: 0, bal: 0 });

    y += 4;
    drawTotalRow(doc, [
      '', 'TOTALS', String(t.full), String(t.half), String(t.work), t.ot.toFixed(1),
      fmtLKR(t.pay), fmtLKR(t.paid), fmtLKR(t.bal),
    ], cols, y);

    drawPdfFooter(doc);
    doc.end();
  }
}
