import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterAdmin1714482613485 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE admin ADD COLUMN status BOOLEAN DEFAULT true AFTER created_by_id`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE admin DROP COLUMN status`)
    }

}
