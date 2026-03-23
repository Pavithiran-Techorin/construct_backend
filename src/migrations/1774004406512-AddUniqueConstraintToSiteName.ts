import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConstraintToSiteName1774004406512 implements MigrationInterface {
    name = 'AddUniqueConstraintToSiteName1774004406512'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sites" ADD CONSTRAINT "UQ_7a7dbd4513de54a315d97e1a7de" UNIQUE ("name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sites" DROP CONSTRAINT "UQ_7a7dbd4513de54a315d97e1a7de"`);
    }

}
