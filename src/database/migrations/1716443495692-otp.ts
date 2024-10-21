import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class otp1716443495692 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'otp',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isNullable: false,
                    generationStrategy: 'increment',
                    isGenerated: true
                }, {
                    name: 'mobileNumber',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: false,
                    length:'255'
                }, {
                    name: 'otp',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: false,
                    length:'255'
                }, {
                    name: 'is_expire',
                    type: 'boolean',
                    isPrimary: false,
                    isNullable: true,
                    default: false
                }, {
                    name: 'created_at',
                    type: 'timestamp',
                    isPrimary: false,
                    isNullable: true,
                    default: 'CURRENT_TIMESTAMP',
                }, {
                    name: 'updated_at',
                    type: 'timestamp',
                    isPrimary: false,
                    default: 'CURRENT_TIMESTAMP',
                    isNullable: true,
                }, {
                    name: 'deleted_at',
                    type: 'timestamp',
                    isPrimary: false,
                    isNullable: true,
                },
            ]
        })
        await queryRunner.createTable(table)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('otp')
    }

}
