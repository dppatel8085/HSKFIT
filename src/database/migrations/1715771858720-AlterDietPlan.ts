import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterDietPlan1715771858720 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE diet_plans CHANGE COLUMN mealplan_pic meal_included varchar(255)`)
        await queryRunner.query(`ALTER TABLE diet_plans ADD COLUMN meal_excluded varchar(255) AFTER is_active`)
        await queryRunner.query(`ALTER TABLE diet_plans ADD COLUMN time varchar(255) AFTER is_active`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE diet_plans DROP COLUMN meal_included`)
        await queryRunner.query(`ALTER TABLE diet_plans DROP COLUMN meal_excluded`)
        await queryRunner.query(`ALTER TABLE diet_plans DROP COLUMN time`)
    }

}
