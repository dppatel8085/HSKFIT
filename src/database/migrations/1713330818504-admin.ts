import { UserRoles } from "../../api/enums/Users";
import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class admin1713330818504 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'admin',
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
                    isNullable: false,
                }, {
                    name: 'email',
                    length: '255',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: false,
                }, {
                    name: 'password',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: false,
                    length: '255'
                }, {
                    name: 'role',
                    type: 'int',
                    isPrimary: false,
                    isNullable: true,
                    default: UserRoles.ADMIN,
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
                    name: 'address',
                    type: 'varchar',
                    isPrimary: false,
                    isNullable: true,
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
            ],
        });
        await queryRunner.createTable(table);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('admin')
    }

}
