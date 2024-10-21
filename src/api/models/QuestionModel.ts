// import { Exclude, Type } from "class-transformer";
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn,  } from "typeorm";
// import { UsersModel } from "./UsersModel";

@Entity({ name: 'question' })
export class QuestionModel extends BaseEntity {

    @ObjectIdColumn()
    public _id: string;

    @Column()
    public key: string;

    @Column()
    public value: string;

    @Column()
    public userId: string;

    @Column()
    public type: string;

    @Column()
    public deletedAt?: Date;

    @CreateDateColumn({ type: 'timestamp' })
    public createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    public updatedAt: Date;

    @BeforeInsert()
    setCreatedAt() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    @BeforeUpdate()
    setUpdatedAt() {
        this.updatedAt = new Date();
    }

}