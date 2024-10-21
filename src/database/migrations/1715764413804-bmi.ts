import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class bmi1715764413804 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'bmi',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isNullable: false,
                    generationStrategy: 'increment',
                    isGenerated: true
                }, {
                    name: 'height',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: false,
                    length:'255'
                }, {
                    name: 'weight',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: false,
                    length:'255'
                }, {
                    name: 'age',
                    type: 'int',
                    isPrimary: false,
                    isNullable: false
                }, {
                    name: 'user_id',
                    type: 'int',
                    isPrimary: false,
                    isNullable: false
                }, {
                    name: 'result',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: false,
                    length:'255'
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
                    isNullable: true,
                }, {
                    name: 'deleted_at',
                    type: 'timestamp',
                    isPrimary: false,
                    isNullable: true,
                },
            ], foreignKeys: [
                {
                    columnNames: ['user_id'],
                    referencedTableName: 'users',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                },
            ]
        })
        await queryRunner.createTable(table)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('bmi')
    }

}

