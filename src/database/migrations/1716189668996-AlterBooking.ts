import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterBooking1716189668996 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE booking CHANGE COLUMN diet_plan_status diet_plan_status varchar(255) DEFAULT 'pending' `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE booking DROP TABLE diet_plan_status`)
    }

}
