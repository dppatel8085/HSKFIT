import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from "typeorm";
// import { Exclude, Expose, Type } from "class-transformer";
// import { RecipeLikeModel } from "./recipeLikeModel";

@Entity({ name: 'recipe' })
export class RecipeModel extends BaseEntity {

    @ObjectIdColumn()
    public _id:string;

    @Column()
    public recipeTitle: string;

    @Column()
    public makingDuration: number;

    @Column()
    public indredient: string;

    @Column()
    public cookingDirection: string;

    @Column()
    public recipeImage: string;

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

    // @Type(() => RecipeLikeModel)
    // @Expose()
    // @OneToMany(type => RecipeLikeModel, RecipeLikeModel => RecipeLikeModel.recipeLikesModel)
    // public recipeLike: RecipeLikeModel;

    // @Type(() => RecipeLikeModel)
    // @Expose()
    // @OneToOne(type => RecipeLikeModel, RecipeLikeModel => RecipeLikeModel.isRecipeLikesModel)
    // public isRecipeLike: RecipeLikeModel;

}
