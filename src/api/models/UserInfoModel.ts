import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from "typeorm";
// import {  Type } from "class-transformer";
// import { UsersModel } from "./UsersModel";

@Entity({ name: 'user_info' })
export class UserInfoModel extends BaseEntity {

    @ObjectIdColumn()
    public _id: string;

    @Column()
    public userId: string;

    @Column()
    public height: string;

    @Column()
    public isFeet: boolean;

    @Column()
    public weight: string;

    @Column()
    public isKg: boolean;

    @Column()
    public dietaryPreference: string;

    @Column()
    public weightLose: string;

    @Column()
    public healthProblem: boolean;

    @Column()
    public healthCondition: string;

    @Column()
    public previousWeightLose: string;

    @Column()
    public ledToYourWeightGain: string;

    @Column()
    public avgDayBusy: string;

    @Column()
    public okayWithPaidPlan: boolean;

    @Column()
    public healthAssesementScore: number;

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
    // @OneToOne(type => UsersModel, usersModel => usersModel.userInfo, { cascade: true })
    // @JoinColumn({ name: 'user_id' })
    // public userModel: UsersModel;

}
