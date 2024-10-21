import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterSubsCriptionPlan1714038715500 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(` ALTER TABLE subscription_plans 
        ADD COLUMN status BOOLEAN DEFAULT false AFTER plan_includes`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE subscription_plans ADD COLUMN status `)
    }

}
