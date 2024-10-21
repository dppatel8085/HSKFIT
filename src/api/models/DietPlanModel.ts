import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn, UpdateDateColumn } from "typeorm";
// import {  Type } from "class-transformer";
// import { UsersModel } from "./UsersModel";


@Entity({ name: 'diet_plans' })
export class DietPlanModel extends BaseEntity {

    @ObjectIdColumn()
    public _id: ObjectID;

    @Column()
    public userId: number;

    @Column()
    public dietitianId: number;

    @Column()
    public days: string;

    @Column()
    public mealIncluded: string;

    @Column()
    public mealExcluded: string;

    @Column()
    public time: string;

    @Column()
    public isActive: boolean;

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
    // @OneToOne(type => UsersModel, usersModel => usersModel.dietPlan, { cascade: true })
    // @JoinColumn({ name: 'user_id' })
    // public userModel: UsersModel;

}
