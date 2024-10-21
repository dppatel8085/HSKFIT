import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterConfiguration1715688647606 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE configuration CHANGE COLUMN value value VARCHAR(600)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE configuration DROP COLUMN value`)
    }

}
