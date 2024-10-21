import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class measurmentTracker1714633909972 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'measurment_tracker',
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
                    name: 'chest',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: false,
                    length: '255'
                }, {
                    name: 'arm',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: false,
                    length: '255'
                }, {
                    name: 'waist',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: false,
                    length: '255'
                }, {
                    name: 'hips',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: false,
                    length: '255'
                }, {
                    name: 'thigh',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: false,
                    length: '255'
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
        await queryRunner.dropTable('measurment_tracker')
    }

}
