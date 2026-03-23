import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSession1742428646009 implements MigrationInterface {
  name = 'InitSession1742428646009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.query(
      `SELECT to_regclass('public.session')`,
    );
    if (!tableExists[0].to_regclass) {
      await queryRunner.query(`
        CREATE TABLE "session" (
          "sid" VARCHAR NOT NULL COLLATE "default",
          "sess" JSON NOT NULL,
          "expire" TIMESTAMP(6) NOT NULL,
          CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
        )
      `);
      await queryRunner.query(
        `CREATE INDEX "IDX_session_expire" ON "session" ("expire")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.query(
      `SELECT to_regclass('public.session')`,
    );
    if (tableExists[0].to_regclass) {
      await queryRunner.query(`DROP TABLE "session"`);
    }
  }
}
