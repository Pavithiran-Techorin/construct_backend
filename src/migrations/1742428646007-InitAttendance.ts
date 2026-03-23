import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAttendance1742428646007 implements MigrationInterface {
  name = 'InitAttendance1742428646007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.query(
      `SELECT to_regclass('public.attendance')`,
    );
    if (!tableExists[0].to_regclass) {
      await queryRunner.query(`
        CREATE TABLE "attendance" (
          "id"          SERIAL          NOT NULL,
          "employee_id" integer         NOT NULL,
          "site_id"     integer         NOT NULL,
          "date"        date            NOT NULL,
          "type"        character varying(10) NOT NULL DEFAULT 'full',
          "ot_hours"    numeric(4, 2)   NOT NULL DEFAULT 0,
          "paid_amount" numeric(10, 2)  NOT NULL DEFAULT 0,
          "created_by"  integer         DEFAULT NULL,
          "created_at"  TIMESTAMP       NOT NULL DEFAULT now(),
          "updated_at"  TIMESTAMP       NOT NULL DEFAULT now(),
          CONSTRAINT "PK_attendance_id" PRIMARY KEY ("id"),
          CONSTRAINT "FK_attendance_employee" FOREIGN KEY ("employee_id")
            REFERENCES "employees"("id") ON DELETE CASCADE,
          CONSTRAINT "FK_attendance_site" FOREIGN KEY ("site_id")
            REFERENCES "sites"("id") ON DELETE CASCADE,
          CONSTRAINT "FK_attendance_created_by" FOREIGN KEY ("created_by")
            REFERENCES "users"("id") ON DELETE SET NULL,
          CONSTRAINT "UQ_attendance" UNIQUE ("employee_id", "site_id", "date")
        )
      `);
      await queryRunner.query(
        `CREATE INDEX "IDX_attendance_employee_id" ON "attendance" ("employee_id")`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_attendance_site_id" ON "attendance" ("site_id")`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_attendance_date" ON "attendance" ("date")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.query(
      `SELECT to_regclass('public.attendance')`,
    );
    if (tableExists[0].to_regclass) {
      await queryRunner.query(`DROP TABLE "attendance"`);
    }
  }
}
