import { BaseEntity, BeforeInsert, BeforeUpdate, Column, Entity, ObjectIdColumn, CreateDateColumn, UpdateDateColumn} from "typeorm";
// import { Exclude } from "class-transformer";
// import { UsersModel } from "./UsersModel";

@Entity({ name: 'booking' })
export class BookingModel extends BaseEntity {

    @ObjectIdColumn()
    public _id: string;

    @Column()
    public userId: string;

    @Column()
    public date: Date;

    @Column()
    public timeSlot: string;

    @Column()
    public isCounsellorConnected: boolean;

    @Column()
    public status: string;

    @Column()
    public userType: string;

    @Column()
    public dietPlanStatus: string;

    @Column()
    public addDate: Date;

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

    // @JoinColumn({ name: 'user_id' })
    // @OneToOne(type => UsersModel, usersModel => usersModel.id)
    // public users: UsersModel

}
