import { BaseEntity, BeforeInsert, BeforeUpdate, Column,  CreateDateColumn,  Entity, ObjectIdColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'follow_up_msg' })
export class FollowUpMsgModel extends BaseEntity {

    @ObjectIdColumn()
    public _id: string;

    @Column()
    public dietitianId: string;

    @Column()
    public userId: string;

    @Column()
    public freeText: string;

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