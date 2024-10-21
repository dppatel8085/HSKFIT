// import { Exclude, Type } from "class-transformer";
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from "typeorm";
// import { UsersModel } from "./UsersModel";

@Entity({ name: 'measurment_tracker' })
export class MeasurmentTrackerModel extends BaseEntity {

    @ObjectIdColumn()
    public _id: string;

    @Column()
    public userId: string;

    @Column()
    public chest: string;

    @Column()
    public arm: string;

    @Column()
    public waist: string;

    @Column()
    public hips: string;

    @Column()
    public thigh: string;

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
    // @OneToOne(type => UsersModel, usersModel => usersModel.measurmentTracker, { cascade: true })
    // @JoinColumn({ name: 'user_id' })
    // public userModel: UsersModel;

}