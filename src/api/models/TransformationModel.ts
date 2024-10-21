// import { Exclude, Expose, Type } from "class-transformer";
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from "typeorm";
// import { RecipeLikeModel } from "./recipeLikeModel";

@Entity({ name: 'transformation' })
export class TransformationModel extends BaseEntity {

  @ObjectIdColumn()
  public _id: string;

  @Column()
  public title: string;

  @Column()
  public shortDesc: string;

  @Column()
  public longDesc: string;

  @Column()
  public image: string;

  @Column()
  public isActive: boolean;

  @Column()
  public externalLink: string

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
  // @OneToMany(type => RecipeLikeModel, recipeLikeModel => recipeLikeModel.transformationModel)
  // public recipeLike: RecipeLikeModel;

  // @Type(() => RecipeLikeModel)
  // @Expose()
  // @OneToOne(type => RecipeLikeModel, recipeLikeModel => recipeLikeModel.transformationsModel)
  // public isRecipeLike: RecipeLikeModel;

}