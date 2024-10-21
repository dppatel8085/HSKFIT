// import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
// import { IsEnum, IsOptional } from "class-validator";
// import { Exclude, Expose, Transform, Type, } from "class-transformer";
// import { DeviceType } from "../enums/DeviceType";
// import { UserActivePlanModel } from "./UserActivePlanModel";
// import { UserInfoModel } from "./UserInfoModel";
// import { AdminModel } from "./AdminModel";
// import { DietPlanModel } from "./DietPlanModel";
// import { BmiModel } from "./BmiModel";
// import { MeasurmentTrackerModel } from "./MeasurmentTrackerModel";
// import { WeightTrackerModel } from "./WeightTrackerModel";
// import { QuestionModel } from "./QuestionModel";
// // import { WaterTrackerModel } from "./WaterTrackerModel";

// @Entity({ name: 'users' })
// export class UsersModel extends BaseEntity {

//     @PrimaryGeneratedColumn()
//     public id: string;

//     @IsOptional()
//     @Column({ name: 'name' })
//     public name: string;

//     @IsOptional()
//     @Column({ name: 'role' })
//     public role: number;

//     @IsOptional()
//     @Column({ name: 'gender' })
//     public gender: string;

//     @IsOptional()
//     @Column({ name: 'age' })
//     public age: number;

//     @IsOptional()
//     @Column({ name: 'address' })
//     public address: string;

//     @IsOptional()
//     @Column({ name: 'mobile_number' })
//     public mobileNumber: string;

//     @IsOptional()
//     @Column({ name: 'is_completed' })
//     public isCompleted: boolean;

//     @IsOptional()
//     @Column({ name: 'profile_pic' })
//     public profilePic: string;

//     @IsOptional()
//     @Column({ name: 'is_step_1' })
//     public isStep1: string;

//     @IsOptional()
//     @Column({ name: 'is_step_2' })
//     public isStep2: boolean;

//     @IsOptional()
//     @Column({ name: 'is_step_3' })
//     public isStep3: string;

//     @IsOptional()
//     @Column({ name: 'is_step_4' })
//     public isStep4: boolean;

//     @IsOptional()
//     @Column({ name: 'is_step_5' })
//     public isStep5: string;

//     @IsOptional()
//     @Column({ name: 'is_step_6' })
//     public isStep6: boolean;

//     @IsOptional()
//     @Column({ name: 'is_step_7' })
//     public isStep7: string;

//     @IsOptional()
//     @Column({ name: 'is_step_8' })
//     public isStep8: boolean;

//     @IsOptional()
//     @Column({ name: 'is_step_9' })
//     public isStep9: string;

//     @IsOptional()
//     @Column({ name: 'is_step_10' })
//     public isStep10: boolean;

//     @IsOptional()
//     @Column({ name: 'is_active' })
//     public isActive: boolean;

//     @IsOptional()
//     @Column({ name: 'device_token' })
//     public deviceToken: string;

//     @IsOptional()
//     @Column({ name: 'is_skip' })
//     public isSkip: boolean;

//     @IsOptional()
//     @Column({ name: 'jwt_token' })
//     public jwtToken: string;

//     @IsOptional()
//     @Column({ name: 'is_completed_step' })
//     public isCompletedStep: number;

//     @IsOptional()
//     @Column({ name: 'dietitian_id' })
//     public dietitianId: number;

//     @IsOptional()
//     @Transform(deviceType => DeviceType[deviceType])
//     @IsEnum(DeviceType)
//     @Column({ name: 'device_type', type: 'enum', enum: DeviceType, default: DeviceType.ANDROID })
//     public deviceType: DeviceType;

//     @Exclude()
//     @Exclude({ toClassOnly: true })
//     @DeleteDateColumn({ name: 'deleted_at' })
//     public readonly deletedAt?: Date;

//     @Exclude({ toClassOnly: true })
//     @CreateDateColumn({ name: 'created_at' })
//     public readonly createdAt: Date;

//     @Exclude({ toClassOnly: true })
//     @UpdateDateColumn({ name: 'updated_at' })
//     public readonly updatedAt: Date;

//     @Type(() => UserActivePlanModel)
//     @Expose()
//     @OneToMany(type => UserActivePlanModel, userActivePlanModel => userActivePlanModel.userModel)
//     public userActivePlan: UserActivePlanModel[];

//     @Type(() => UserInfoModel)
//     @Expose()
//     @OneToOne(type => UserInfoModel, userInfoModel => userInfoModel.userModel)
//     public userInfo: UserInfoModel;

//     @Type(() => AdminModel)
//     @OneToOne(type => AdminModel, adminModel => adminModel.users, { cascade: true })
//     @JoinColumn({ name: 'dietitian_id' })
//     public adminModel: AdminModel;

//     @JoinColumn({ name: 'dietitian_id' })
//     @OneToOne(type => AdminModel, AdminModel => AdminModel.id)
//     public dietitan: AdminModel;

//     @Type(() => DietPlanModel)
//     @Expose()
//     @OneToMany(type => DietPlanModel, DietPlanModel => DietPlanModel.userModel)
//     public dietPlan: DietPlanModel;

//     @Type(() => BmiModel)
//     @Expose()
//     @OneToMany(type => BmiModel, bmiModel => bmiModel.userModel)
//     public bmi: BmiModel;

//     @Type(() => MeasurmentTrackerModel)
//     @Expose()
//     @OneToMany(type => MeasurmentTrackerModel, measurmentTrackerModel => measurmentTrackerModel.userModel)
//     public measurmentTracker: MeasurmentTrackerModel;

//     @Type(() => WeightTrackerModel)
//     @Expose()
//     @OneToMany(type => WeightTrackerModel, weightTrackerModel => weightTrackerModel.userModel)
//     public weightTracker: WeightTrackerModel;

//     @Type(() => QuestionModel)
//     @Expose()
//     @OneToMany(type => QuestionModel, questionModel => questionModel.userModel)
//     public question: QuestionModel;


// }

import { BaseEntity, BeforeInsert, BeforeUpdate, Column,  CreateDateColumn,  Entity, ObjectIdColumn, UpdateDateColumn } from "typeorm";
import { IsEnum } from "class-validator";
import { Transform, } from "class-transformer";
import { DeviceType } from "../enums/DeviceType";
// import { UserActivePlanModel } from "./UserActivePlanModel";
// import { UserInfoModel } from "./UserInfoModel";
// import { AdminModel } from "./AdminModel";
// import { DietPlanModel } from "./DietPlanModel";
// import { BmiModel } from "./BmiModel";
// import { MeasurmentTrackerModel } from "./MeasurmentTrackerModel";
// import { WeightTrackerModel } from "./WeightTrackerModel";
// import { QuestionModel } from "./QuestionModel";
// import { WaterTrackerModel } from "./WaterTrackerModel";

@Entity({ name: 'users' })
export class UsersModel extends BaseEntity {

    @ObjectIdColumn()
    public _id: string;

    @Column()
    public name: string;

    @Column()
    public role: number;

    @Column()
    public gender: string;

    @Column()
    public age: number;

    @Column()
    public address: string;

    @Column()
    public mobileNumber: string;

    @Column()
    public isCompleted: boolean;

    @Column()
    public profilePic: string;

    @Column()
    public isStep1: string;

    @Column()
    public isStep2: boolean;

    @Column()
    public isStep3: string;

    @Column()
    public isStep4: boolean;

    @Column()
    public isStep5: string;

    @Column()
    public isStep6: boolean;

    @Column()
    public isStep7: string;

    @Column()
    public isStep8: boolean;

    @Column()
    public isStep9: string;

    @Column()
    public isStep10: boolean;

    @Column()
    public isActive: boolean;

    @Column()
    public deviceToken: string;

    @Column()
    public isSkip: boolean;

    @Column()
    public jwtToken: string;

    @Column()
    public isCompletedStep: number;

    @Column()
    public dietitianId: string;

    @Transform(deviceType => DeviceType[deviceType])
    @IsEnum(DeviceType)
    @Column({ name: 'device_type', type: 'enum', enum: DeviceType, default: DeviceType.ANDROID })
    public deviceType: DeviceType;

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

    // @Type(() => UserActivePlanModel)
    // @Expose()
    // @OneToMany(type => UserActivePlanModel, userActivePlanModel => userActivePlanModel.userModel)
    // public userActivePlan: UserActivePlanModel[];

    // @Type(() => UserInfoModel)
    // @Expose()
    // @OneToOne(type => UserInfoModel, userInfoModel => userInfoModel.userModel)
    // public userInfo: UserInfoModel;

    // @Type(() => AdminModel)
    // @OneToOne(type => AdminModel, adminModel => adminModel.users, { cascade: true })
    // @JoinColumn({ name: 'dietitian_id' })
    // public adminModel: AdminModel;

    // @JoinColumn({ name: 'dietitian_id' })
    // @OneToOne(type => AdminModel, AdminModel => AdminModel._id)
    // public dietitan: AdminModel;

    // @Type(() => DietPlanModel)
    // @Expose()
    // @OneToMany(type => DietPlanModel, DietPlanModel => DietPlanModel.userModel)
    // public dietPlan: DietPlanModel;

    // @Type(() => BmiModel)
    // @Expose()
    // @OneToMany(type => BmiModel, bmiModel => bmiModel.userModel)
    // public bmi: BmiModel;

    // @Type(() => MeasurmentTrackerModel)
    // @Expose()
    // @OneToMany(type => MeasurmentTrackerModel, measurmentTrackerModel => measurmentTrackerModel.userModel)
    // public measurmentTracker: MeasurmentTrackerModel;

    // @Type(() => WeightTrackerModel)
    // @Expose()
    // @OneToMany(type => WeightTrackerModel, weightTrackerModel => weightTrackerModel.userModel)
    // public weightTracker: WeightTrackerModel;

    // @Type(() => QuestionModel)
    // @Expose()
    // @OneToMany(type => QuestionModel, questionModel => questionModel.userModel)
    // public question: QuestionModel;


}

