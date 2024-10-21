import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterBooking1715866524019 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE booking ADD COLUMN diet_plan_status VARCHAR(255) AFTER status`)
        await queryRunner.query(`ALTER TABLE booking ADD COLUMN add_date TIMESTAMP AFTER user_type`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE booking DROP COLUMN diet_plan_status`)
        await queryRunner.query(`ALTER TABLE booking DROP COLUMN add_date`)
    }

}
