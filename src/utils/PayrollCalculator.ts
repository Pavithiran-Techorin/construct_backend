export class PayrollCalculator {
  private static readonly OT_DIVISOR = 8; // Defines hourly rate base

  /**
   * Calculates logic for OT pay based on salary and OT hours
   */
  static calculateOTPay(salary: number, otHours: number): number {
    return (otHours || 0) * (salary / this.OT_DIVISOR);
  }

  /**
   * Calculates base pay for a specific attendance type status
   */
  static calculateBasePay(salary: number, type: string): number {
    if (type === 'absent') return 0;
    return type === 'full' ? salary : salary * 0.5;
  }

  /**
   * Calculates total pay (base + OT) for a single daily attendance record
   */
  static calculateDailyPayable(salary: number, type: string, otHours: number): number {
    return this.calculateBasePay(salary, type) + this.calculateOTPay(salary, otHours);
  }

  /**
   * Calculates the total aggregate payable over multiple days via grouped summary
   */
  static calculateAggregatePayable(salary: number, fullDays: number, halfDays: number, totalOtHours: number): number {
    const basePay = (fullDays * salary) + (halfDays * salary * 0.5);
    const otPay = this.calculateOTPay(salary, totalOtHours);
    return basePay + otPay;
  }
}
