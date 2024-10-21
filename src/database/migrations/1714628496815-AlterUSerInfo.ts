import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterUSerInfo1714628496815 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE user_info CHANGE COLUMN weight weight varchar(255)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE user_info DROP COLUMN weight_in_lb`)
    }

}
