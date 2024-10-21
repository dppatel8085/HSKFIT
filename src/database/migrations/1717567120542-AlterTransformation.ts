import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterTransformation1717567120542 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE transformation ADD COLUMN external_link VARCHAR(255) AFTER image`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE transformation DROP COLUMN external_link`)
    }

}
