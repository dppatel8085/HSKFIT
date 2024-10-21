import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterUsers1713504611456 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users ADD COLUMN is_skip BOOLEAN DEFAULT(false)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users DROP COLUMN is_skip`)
    }

}
