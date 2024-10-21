import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class weightTracker1714376626615 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'weight_tracker',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isNullable: false,
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                }, {
                    name: 'user_id',
                    type: 'int',
                    isNullable: false,
                    isPrimary: false,
                }, {
                    name: 'weight_in_kg',
                    type: 'int',
                    isPrimary: false,
                    isNullable: false
                }, {
                    name: 'weight_in_lb',
                    type: 'int',
                    isPrimary: false,
                    isNullable: false
                }, {
                    name: 'created_at',
                    type: 'timestamp',
                    isPrimary: false,
                    isNullable: false,
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
            ],
        })
        await queryRunner.createTable(table)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('weight_tracker')
    }

}



