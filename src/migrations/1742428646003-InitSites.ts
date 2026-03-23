import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSites1742428646003 implements MigrationInterface {
  name = 'InitSites1742428646003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.query(
      `SELECT to_regclass('public.sites')`,
    );
    if (!tableExists[0].to_regclass) {
      await queryRunner.query(`
        CREATE TABLE "sites" (
          "id"         SERIAL                 NOT NULL,
          "name"       character varying(200) NOT NULL,
          "address"    text                   NOT NULL,
          "created_at" TIMESTAMP              NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP              NOT NULL DEFAULT now(),
          CONSTRAINT "PK_sites_id" PRIMARY KEY ("id")
        )
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.query(
      `SELECT to_regclass('public.sites')`,
    );
    if (tableExists[0].to_regclass) {
      await queryRunner.query(`DROP TABLE "sites"`);
    }
  }
}
