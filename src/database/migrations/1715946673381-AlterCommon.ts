import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterCommon1715946673381 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users CHANGE COLUMN updated_at updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`)
        await queryRunner.query(`ALTER TABLE recipe CHANGE COLUMN updated_at updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`)
        await queryRunner.query(`ALTER TABLE transformation CHANGE COLUMN updated_at updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`)
        await queryRunner.query(`ALTER TABLE booking CHANGE COLUMN updated_at updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`)
        await queryRunner.query(`ALTER TABLE stories CHANGE COLUMN updated_at updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`)
        await queryRunner.query(`ALTER TABLE subscription_plans CHANGE COLUMN updated_at updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`)
        await queryRunner.query(`ALTER TABLE admin CHANGE COLUMN updated_at updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users DROP TABLE updated_at`)
        await queryRunner.query(`ALTER TABLE recipe DROP TABLE updated_at`)
        await queryRunner.query(`ALTER TABLE transformation DROP TABLE updated_at`)
        await queryRunner.query(`ALTER TABLE booking DROP TABLE updated_at`)
        await queryRunner.query(`ALTER TABLE stories DROP TABLE updated_at`)
        await queryRunner.query(`ALTER TABLE subscription_plans DROP TABLE updated_at`)
        await queryRunner.query(`ALTER TABLE admin DROP TABLE updated_at`)
    }

}
