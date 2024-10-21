import { LoggerInterface } from "../../lib/logger";
import { Service } from "typedi";
import { OrmRepository } from "typeorm-typedi-extensions";
import { Logger } from "../../decorators/Logger";
import { RecipeLikeModel } from "../models/recipeLikeModel";
import { RecipeLikeRepository } from "../repositories/RecipeLikeRepository";
import { RecipeRequest } from "../controllers/requests/RecipeLike";
import { ObjectId } from 'mongodb'


@Service()
export class RecipeLikeService {
    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private recipeLikeRepository: RecipeLikeRepository,
    ) { }

    /* ------------------ add recipe like by user------------------ */
    public async addRecipeLike(body: RecipeRequest, res): Promise<RecipeLikeModel | any> {
        this.log.info(`add recipe like by user ${body}`)
        const userIdObject = new ObjectId(body?.userId);
        const recipeIdObject=new ObjectId(body?.recipeId)
        body.userId=userIdObject;
        body.recipeId=recipeIdObject;
        const isLikeExist = await this.recipeLikeRepository.findOne({ userId:  body.userId, recipeId: body?.recipeId, isRecipe: body?.isRecipe});
        if (!isLikeExist){
            const res= await this.recipeLikeRepository.save(body);
            res._id=res?._id?.toString();
            res.userId=res?.userId?.toString();
            res.recipeId=res?.recipeId?.toString();
            return res;
        }
        await this.recipeLikeRepository.delete(isLikeExist?._id);
        return res.status(200).send({ success: true, MESSAGE: 'SUCCESSFULLY_DELETE' })
    }

}