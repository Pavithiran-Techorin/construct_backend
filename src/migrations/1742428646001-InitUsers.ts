import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUsers1742428646001 implements MigrationInterface {
  name = 'InitUsers1742428646001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.query(
      `SELECT to_regclass('public.users')`,
    );
    if (!tableExists[0].to_regclass) {
      await queryRunner.query(`
        CREATE TABLE "users" (
          "id"         SERIAL                   NOT NULL,
          "first_name" character varying(100)   NOT NULL,
          "last_name"  character varying(100)   NOT NULL,
          "email"      character varying(255)   NOT NULL UNIQUE,
          "password"   character varying(255)   NOT NULL,
          "role"       character varying(10)    NOT NULL DEFAULT 'user',
          "created_at" TIMESTAMP                NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP                NOT NULL DEFAULT now(),
          CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
        )
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.query(
      `SELECT to_regclass('public.users')`,
    );
    if (tableExists[0].to_regclass) {
      await queryRunner.query(`DROP TABLE "users"`);
    }
  }
}
