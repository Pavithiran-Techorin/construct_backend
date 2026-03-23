import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBalanceAmountToAttendance1774001171720 implements MigrationInterface {
    name = 'AddBalanceAmountToAttendance1774001171720'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" ADD "balance_amount" numeric(10,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" DROP COLUMN "balance_amount"`);
    }

}
