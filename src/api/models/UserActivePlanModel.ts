import { BaseEntity, BeforeInsert, BeforeUpdate, Column,  CreateDateColumn,  Entity, ObjectIdColumn, UpdateDateColumn } from "typeorm";
// import { Exclude, Type, } from "class-transformer";
// import { UsersModel } from "./UsersModel";
// import { SubsCriptionPlansModel } from "./SubscriptionPlansModel";

@Entity({ name: 'user_active_plan' })
export class UserActivePlanModel extends BaseEntity {

    @ObjectIdColumn()
    public id: string;

    @Column()
    public userId: string;

    @Column()
    public planId: string;

    @Column()
    public activationDate: Date;

    @Column()
    public expiredDate: Date;

    @Column()
    public planActivatedById: number;

    @Column()
    public paymentMode: string;

    @Column()
    public isExpire: boolean;

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
    // @OneToOne(type => UsersModel, usersModel => usersModel.userActivePlan, { cascade: true })
    // @JoinColumn({ name: 'user_id' })
    // public userModel: UsersModel;

    // @JoinColumn({ name: 'plan_id' })
    // @OneToOne(type => SubsCriptionPlansModel, subsCriptionPlansModel => subsCriptionPlansModel._id)
    // public subsCription: SubsCriptionPlansModel
}
