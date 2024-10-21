import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterUserInfo1718018388865 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE user_info CHANGE COLUMN height height VARCHAR(255)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE user_info DROP COLUMN height`)
    }

}
