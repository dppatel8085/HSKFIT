import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterUserActivePlan1716376911811 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE user_active_plan
        CHANGE COLUMN activation_date activation_date DATETIME NOT NULL
    `);
        await queryRunner.query(`
        ALTER TABLE user_active_plan
        CHANGE COLUMN expired_date expired_date DATETIME
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE user_active_plan DROP COLUMN activation_date`)
        await queryRunner.query(`ALTER TABLE user_active_plan DROP COLUMN expired_date`)
    }

}
