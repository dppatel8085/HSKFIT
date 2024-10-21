import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterWeight1714562430593 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE weight_tracker CHANGE COLUMN weight_in_lb weight_in_lb INT(11) DEFAULT NULL`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE weight_tracker DROP COLUMN weight_in_lb`)
    }

}
