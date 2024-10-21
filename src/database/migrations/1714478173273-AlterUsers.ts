import { StepCompletedDefault } from "../../api/enums/Users";
import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterUsers1714478173273 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users ADD COLUMN is_completed_step INT(11) DEFAULT ${StepCompletedDefault.COMPLETED}  AFTER is_active`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users DROP COLUMN is_completed_step`)
    }

}
