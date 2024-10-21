import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ObjectIdColumn, Unique, UpdateDateColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
// import {  Expose, Type } from "class-transformer";
// import { UsersModel } from "./UsersModel";

@Entity({ name: 'admin' })
@Unique(['email'])
export class AdminModel extends BaseEntity {


    public static hashPassword(password: string): Promise<string> {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    }

    public static comparePassword(user: AdminModel, password: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                resolve(res === true);
            });
        });
    }

    @ObjectIdColumn()
    public _id: string;

    @Column()
    public name: string;

    @Column()
    public role: number;

    @Column()
    public email: string;

    @Column()
    public password: string;

    @Column()
    public mobileNumber: string;

    @Column()
    public profilePic: string;

    @Column()
    public address: string;

    @Column()
    public createdById: number;

    @Column()
    public status: boolean;

    @Column()
    public jwtToken:string;

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
    // @Expose()
    // @OneToMany(type => UsersModel, usersModel => usersModel.adminModel)
    // public users: UsersModel;


}
