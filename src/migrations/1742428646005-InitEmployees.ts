import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitEmployees1742428646005 implements MigrationInterface {
  name = 'InitEmployees1742428646005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // employees table
    const empExists = await queryRunner.query(
      `SELECT to_regclass('public.employees')`,
    );
    if (!empExists[0].to_regclass) {
      await queryRunner.query(`
        CREATE TABLE "employees" (
          "id"             SERIAL                    NOT NULL,
          "emp_id"         integer                   NOT NULL UNIQUE,
          "full_name"      character varying(200)    NOT NULL,
          "nic"            character varying(20)     NOT NULL UNIQUE,
          "telephone"      character varying(20)     NOT NULL,
          "per_day_salary" numeric(10, 2)            NOT NULL,
          "photo"          text                      DEFAULT NULL,
          "created_at"     TIMESTAMP                 NOT NULL DEFAULT now(),
          "updated_at"     TIMESTAMP                 NOT NULL DEFAULT now(),
          CONSTRAINT "PK_employees_id" PRIMARY KEY ("id")
        )
      `);
    }

    // employee_sites join table
    const joinExists = await queryRunner.query(
      `SELECT to_regclass('public.employee_sites')`,
    );
    if (!joinExists[0].to_regclass) {
      await queryRunner.query(`
        CREATE TABLE "employee_sites" (
          "employee_id" integer NOT NULL,
          "site_id"     integer NOT NULL,
          CONSTRAINT "PK_employee_sites" PRIMARY KEY ("employee_id", "site_id"),
          CONSTRAINT "FK_employee_sites_employee" FOREIGN KEY ("employee_id")
            REFERENCES "employees"("id") ON DELETE CASCADE,
          CONSTRAINT "FK_employee_sites_site" FOREIGN KEY ("site_id")
            REFERENCES "sites"("id") ON DELETE CASCADE
        )
      `);
      await queryRunner.query(
        `CREATE INDEX "IDX_employee_sites_employee_id" ON "employee_sites" ("employee_id")`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_employee_sites_site_id" ON "employee_sites" ("site_id")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const joinExists = await queryRunner.query(
      `SELECT to_regclass('public.employee_sites')`,
    );
    if (joinExists[0].to_regclass) {
      await queryRunner.query(`DROP TABLE "employee_sites"`);
    }

    const empExists = await queryRunner.query(
      `SELECT to_regclass('public.employees')`,
    );
    if (empExists[0].to_regclass) {
      await queryRunner.query(`DROP TABLE "employees"`);
    }
  }
}
