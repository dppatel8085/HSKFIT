// import {  Type } from "class-transformer";
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from "typeorm";
// import { UsersModel } from "./UsersModel";

@Entity({ name: 'bmi' })
export class BmiModel extends BaseEntity {

    @ObjectIdColumn()
    public _id: string

    @Column()
    public height: string;

    @Column()
    public weight: string;

    @Column()
    public age: number;

    @Column()
    public userId: string;

    @Column()
    public result: string;

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

    // @Type(() => UsersModel)
    // @OneToOne(type => UsersModel, usersModel => usersModel.bmi, { cascade: true })
    // @JoinColumn({ name: 'user_id' })
    // public userModel: UsersModel;

}