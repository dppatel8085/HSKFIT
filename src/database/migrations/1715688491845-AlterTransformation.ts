import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTransformation1715688491845 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE transformation CHANGE COLUMN long_desc long_desc VARCHAR(600)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE transformation DROP COLUMN long_desc`)
    }

}
