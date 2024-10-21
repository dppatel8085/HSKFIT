import { EntityRepository, Repository } from "typeorm";
import { RecipeLikeModel } from "../models/recipeLikeModel";

@EntityRepository(RecipeLikeModel)
export class RecipeLikeRepository extends Repository<RecipeLikeModel> {

}