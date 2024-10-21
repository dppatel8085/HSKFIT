import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterUserActivePlan1714217308062 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE user_active_plan ADD COLUMN is_expire boolean default false AFTER expired_date`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE user_active_plan DROP COLUMN is_expire`)
    }

}
