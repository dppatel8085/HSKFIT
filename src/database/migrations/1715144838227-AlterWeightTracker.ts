import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterWeightTracker1715144838227 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE weight_tracker CHANGE COLUMN weight_in_kg weight_in_kg varchar(255)`)
        await queryRunner.query(`ALTER TABLE weight_tracker CHANGE COLUMN weight_in_lb weight_in_lb varchar(255)`)

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE weight_tracker DROP COLUMN weight_in_kg`)
        await queryRunner.query(`ALTER TABLE weight_tracker DROP COLUMN weight_in_lb`)

    }

}
