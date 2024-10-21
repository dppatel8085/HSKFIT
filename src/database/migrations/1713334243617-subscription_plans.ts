import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class subscriptionPlans1713334243617 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'subscription_plans',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isNullable: false,
                    isGenerated: true,
                    generationStrategy: 'increment',
                }, {
                    name: 'duration_in_month',
                    type: 'int',
                    isPrimary: false,
                    isNullable: false,
                }, {
                    name: 'plan_name',
                    length: '255',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: false,
                }, {
                    name: 'plan_includes',
                    type: 'varchar',
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
            ],
        });
        await queryRunner.createTable(table);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('subscription_plans')
    }

}
