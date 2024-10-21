import { UserRoles } from "../../api/enums/Users";
import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class users1713330858356 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'users',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isNullable: false,
                    isGenerated: true,
                    generationStrategy: 'increment',
                }, {
                    name: 'name',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'role',
                    type: 'int',
                    isPrimary: false,
                    isNullable: true,
                    comment: '1 = admin, 2=user',
                    default: UserRoles.USER,
                }, {
                    name: 'gender',
                    length: '255',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'age',
                    type: 'int',
                    isPrimary: false,
                    isNullable: true,
                    length: '255'
                }, {
                    name: 'address',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: true,
                    length: '255'
                }, {
                    name: 'mobile_number',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: true,
                    length: '255'
                }, {
                    name: 'profile_pic',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: true,
                    length: '255'
                }, {
                    name: 'is_completed',
                    type: 'boolean',
                    isPrimary: false,
                    isNullable: true,
                    default: false
                }, {
                    name: 'is_step_1',
                    type: 'boolean',
                    isPrimary: false,
                    isNullable: true,
                    default: false
                }, {
                    name: 'is_step_2',
                    type: 'boolean',
                    isPrimary: false,
                    isNullable: true,
                    default: false
                }, {
                    name: 'is_step_3',
                    type: 'boolean',
                    isPrimary: false,
                    isNullable: true,
                    default: false
                }, {
                    name: 'is_step_4',
                    type: 'boolean',
                    isPrimary: false,
                    isNullable: true,
                    default: false
                }, {
                    name: 'is_step_5',
                    type: 'boolean',
                    isPrimary: false,
                    isNullable: true,
                    default: false
                }, {
                    name: 'is_step_6',
                    type: 'boolean',
                    isPrimary: false,
                    isNullable: true,
                    default: false
                }, {
                    name: 'is_step_7',
                    type: 'boolean',
                    isPrimary: false,
                    isNullable: true,
                    default: false
                }, {
                    name: 'is_step_8',
                    type: 'boolean',
                    isPrimary: false,
                    isNullable: true,
                    default: false
                }, {
                    name: 'is_step_9',
                    type: 'boolean',
                    isPrimary: false,
                    isNullable: true,
                    default: false
                }, {
                    name: 'is_step_10',
                    type: 'boolean',
                    isPrimary: false,
                    isNullable: true,
                    default: false
                }, {
                    name: 'is_active',
                    type: 'boolean',
                    isPrimary: false,
                    isNullable: true,
                    default: true
                }, {
                    name: 'device_token',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: true,
                    length: '255'
                }, {
                    name: 'device_type',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: true,
                    default: "'android'",
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
        });
        await queryRunner.createTable(table);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users')
    }

}
