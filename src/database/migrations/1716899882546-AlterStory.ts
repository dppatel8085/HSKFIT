import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterStory1716899882546 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE stories
        CHANGE COLUMN story_start_date story_start_date DATETIME NOT NULL
    `);
        await queryRunner.query(`
        ALTER TABLE stories
        CHANGE COLUMN story_end_date story_end_date DATETIME NOT NULL
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE stories DROP COLUMN story_start_date`)
        await queryRunner.query(`ALTER TABLE stories DROP COLUMN story_end_date`)
    }

}
