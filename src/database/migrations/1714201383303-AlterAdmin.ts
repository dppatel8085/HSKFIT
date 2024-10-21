import { UserRoles } from "../../api/enums/Users";
import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterAdmin1714201383303 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE admin ADD COLUMN created_by_id INT(11) AFTER address`)
        await queryRunner.query(`ALTER TABLE admin CHANGE COLUMN role role INT(11) DEFAULT ${UserRoles.DIETITIAN}`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE admin DROP COLUMN created_by_id`)
        await queryRunner.query(`'ALTER TABLE admin CHANGE COLUMN role `)
    }

}