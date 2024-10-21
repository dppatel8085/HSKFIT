import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class configuration1715230614516 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table=new Table({
            name:'configuration',
            columns:[
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isNullable: false,
                    generationStrategy: 'increment',
                    isGenerated: true
                }, {
                    name: 'key',
                    type: 'text',
                    isPrimary: false,
                    isNullable: false,
                    length: '255'
                }, {
                    name: 'value',
                    type: 'text',
                    isPrimary: false,
                    isNullable: false,
                    length: '255'
                },{
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
            ]
        })
        await queryRunner.createTable(table)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('configuration')
    }

}
