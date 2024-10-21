import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterMealPicture1716986387054 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE meal_picture DROP COLUMN diet_plan_id`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE meal_picture DROP COLUMN diet_plan_id`)
    }

}
