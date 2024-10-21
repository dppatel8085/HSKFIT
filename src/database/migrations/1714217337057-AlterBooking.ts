import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterBooking1714217337057 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE booking ADD COLUMN status varchar(255) AFTER is_counsellor_connected`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE booking DROP COLUMN status`)
    }

}
