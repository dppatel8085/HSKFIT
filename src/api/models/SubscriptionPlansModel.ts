import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from "typeorm";
// import { Exclude } from "class-transformer";

@Entity({ name: 'subscription_plans' })
export class SubsCriptionPlansModel extends BaseEntity {

    @ObjectIdColumn()
    public _id: any;

    @Column()
    public durationInMonth: number;

    @Column()
    public planName: string;

    @Column()
    public planIncludes: string;

    @Column()
    public status: boolean;

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
