// import { Exclude } from "class-transformer";
import { BaseEntity, BeforeInsert, BeforeUpdate, Column,  CreateDateColumn,  Entity, ObjectIdColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'otp' })
export class OtpModel extends BaseEntity {

    @ObjectIdColumn()
    public _id: string;

    @Column()
    public mobileNumber: string;

    @Column()
    public otp: string;

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