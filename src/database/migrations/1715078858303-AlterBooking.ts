import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterBooking1715078858303 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE booking ADD COLUMN user_type varchar(255) DEFAULT 'free' AFTER status`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE booking DROP COLUMN user_type`)
    }

}
