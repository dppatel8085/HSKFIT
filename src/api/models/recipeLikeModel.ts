// import { Exclude,  } from "class-transformer";
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn,  } from "typeorm";
// import { RecipeModel } from "./RecipeModel";
// import { TransformationModel } from "./TransformationModel";

@Entity({ name: 'recipe_like' })
export class RecipeLikeModel extends BaseEntity {

    @ObjectIdColumn()
    public _id: string;

    @Column()
    public userId: any;

    @Column()
    public recipeId: any;

    @Column()
    public isLike: boolean;

    @Column()
    public isRecipe: boolean;

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

    // @Type(() => RecipeModel)
    // @OneToOne(type => RecipeModel, recipeModel => recipeModel.recipeLike, { cascade: true })
    // @JoinColumn({ name: 'recipeId' })
    // public recipeLikesModel: RecipeModel;

    // @Type(() => RecipeModel)
    // @OneToOne(type => RecipeModel, recipeModel => recipeModel.isRecipeLike, { cascade: true })
    // @JoinColumn({ name: 'recipe_id' })
    // public isRecipeLikesModel: RecipeModel;

    // @Type(() => TransformationModel)
    // @OneToOne(type => TransformationModel, transformationModel => transformationModel.recipeLike, { cascade: true })
    // @JoinColumn({ name: 'recipe_id' })
    // public transformationModel: TransformationModel;

    // @Type(() => TransformationModel)
    // @OneToOne(type => TransformationModel, transformationModel => transformationModel.isRecipeLike, { cascade: true })
    // @JoinColumn({ name: 'recipe_id' })
    // public transformationsModel: TransformationModel;

}