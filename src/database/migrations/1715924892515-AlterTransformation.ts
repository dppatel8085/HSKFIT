import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTransformation1715924892515 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE transformation CHANGE COLUMN long_desc long_desc VARCHAR(1000)`)
        await queryRunner.query(`ALTER TABLE configuration CHANGE COLUMN value value VARCHAR(1000)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE transformation DROP COLUMN long_desc`)
        await queryRunner.query(`ALTER TABLE configuration DROP COLUMN value`)
    }

}
