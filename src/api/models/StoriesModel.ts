import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from "typeorm";
// import { Exclude } from "class-transformer";

@Entity({ name: 'stories' })
export class StoriesModel extends BaseEntity {

    @ObjectIdColumn()
    public _id: string;

    @Column()
    public storiesTitle: string;

    @Column()
    public storiesImage: string;

    @Column()
    public externalLink: string;

    @Column()
    public storyViewImg: string;

    @Column()
    public storyStartDate: Date;

    @Column()
    public storyEndDate: Date;

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


}
