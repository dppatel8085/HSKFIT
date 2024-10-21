import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class mealPicture1715148619435 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'meal_picture',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isNullable: false,
                    generationStrategy: 'increment',
                    isGenerated: true
                }, {
                    name: 'user_id',
                    type: 'int',
                    isPrimary: false,
                    isNullable: false
                }, {
                    name: 'diet_plan_id',
                    type: 'int',
                    isPrimary: false,
                    isNullable: false,
                }, {
                    name: 'meal_image',
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
            ]
        })
        await queryRunner.createTable(table)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('meal_picture')
    }

}
