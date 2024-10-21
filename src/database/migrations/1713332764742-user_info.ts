import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class userInfo1713332764742 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'user_info',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isNullable: false,
                    isGenerated: true,
                    generationStrategy: 'increment',
                }, {
                    name: 'user_id',
                    type: 'int',
                    isPrimary: false,
                    isNullable: false,
                }, {
                    name: 'height',
                    length: '255',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: false,
                }, {
                    name: 'is_feet',
                    type: 'boolean',
                    isPrimary: false,
                    isNullable: true,
                    default: true
                }, {
                    name: 'weight',
                    type: 'int',
                    isPrimary: false,
                    isNullable: true
                }, {
                    name: 'is_kg',
                    type: 'boolean',
                    isPrimary: false,
                    isNullable: true,
                    default: true
                }, {
                    name: 'dietary_preference',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: true,
                    length: '255'
                }, {
                    name: 'weight_lose',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: true,
                    length: '255'
                }, {
                    name: 'health_problem',
                    type: 'boolean',
                    isPrimary: false,
                    isNullable: true,
                    default: false
                }, {
                    name: 'health_condition',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: true,
                    length:'255'
                }, {
                    name: 'previous_weight_lose',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: true,
                    length:'255'
                }, {
                    name: 'led_to_your_weight_gain',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: true,
                    length:'255'
                }, {
                    name: 'avg_day_busy',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: true,
                    length:'255'
                }, {
                    name: 'okay_with_paid_plan',
                    type: 'boolean',
                    isPrimary: false,
                    isNullable: true,
                    default: false
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
            ],
            foreignKeys: [
                {
                    columnNames: ['user_id'],
                    referencedTableName: 'users',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                },
            ],
        });
        await queryRunner.createTable(table);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('user_info')
    }

}
