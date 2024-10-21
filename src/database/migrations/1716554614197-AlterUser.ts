import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterUser1716554614197 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE admin ADD COLUMN jwt_token VARCHAR(255) AFTER status`)
        await queryRunner.query(`ALTER TABLE users ADD COLUMN jwt_token VARCHAR(255) AFTER device_type`)

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE admin DROP COLUMN jwt_token`)
        await queryRunner.query(`ALTER TABLE users DROP COLUMN jwt_token`)
    }

}
