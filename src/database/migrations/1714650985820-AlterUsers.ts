import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AlterUsers1714650985820 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE user_info ADD COLUMN health_assesement_score INT(11) AFTER okay_with_paid_plan`)
        await queryRunner.addColumn("users", new TableColumn({
            name: "dietitian_id",
            type: "int",
            isNullable: true
        }));
        await queryRunner.createForeignKey('users', new TableForeignKey({
            columnNames: ['dietitian_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'admin',
            onDelete: 'CASCADE',
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE user_info DROP COLUMN health_assesement_score`)
        await queryRunner.query(`ALTER TABLE users DROP COLUMN dietician_id `)
    }

}
