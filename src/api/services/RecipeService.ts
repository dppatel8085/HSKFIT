import { Logger, LoggerInterface } from "../../decorators/Logger";
import { Service } from "typedi";
import { OrmRepository } from "typeorm-typedi-extensions";
import { RecipeRepository } from "../repositories/RecipeRepository";
import { RecipeModel } from "../models/RecipeModel";
import { RecipeNotFound } from "../errors/Recipe";
import { Pagination } from "nestjs-typeorm-paginate";
import { RecipeRes } from "../controllers/respons/Recipe";
import { Filter } from "../controllers/requests/User";
import { Role } from "../enums/Users";
import { ObjectId } from 'mongodb';

@Service()
export class RecipeService {
    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private recipeRepository: RecipeRepository,
    ) {
    }

    /* ------------------ add recipe by admin ------------------ */
    public async addRecipe(body: any): Promise<RecipeModel> {
        body.isActive = true;
        return await this.recipeRepository.save(body);
    }

    /* ----------------------- delete recipe by admin --------------- */
    public async deleteRecipe(id: string, res: any): Promise<RecipeModel> {
        this.log.info(`delete by admin ${id}`)
        const _id = new ObjectId(id);
        await this.getRecipeData(_id);
        await this.recipeRepository.delete(_id);
        return res.status(200).send({ success: true, MESSAGE: 'SUCCESSFULLY_DELETE' })
    }

    /* -------------------------- get recipe data by id ----------------- */
    public async getRecipeData(id): Promise<RecipeModel | any> {
        this.log.info(`get recipe data by ${id}`)
        const recipeData = await this.recipeRepository.findOne({ _id: id });
        if (recipeData) return recipeData;
        throw new RecipeNotFound()
    }

    /* --------------------- edit recipe by admin ---------------------- */
    public async editRecipe(body: RecipeRes): Promise<RecipeModel> {
        const objectId = new ObjectId(body?._id);
        body.id = objectId;
        const recipeData = await this.getRecipeData(body?.id);
        recipeData.recipeTitle = body?.recipeTitle;
        recipeData.makingDuration = body?.makingDuration;
        recipeData.indredient = body?.indredient;
        recipeData.cookingDirection = body?.cookingDirection;
        recipeData.recipeImage = body?.recipeImage;
        if (body?.isActive)
            recipeData.isActive = (body?.isActive == 'true') ? true : false;
        await this.recipeRepository.save(recipeData);
        return await this.getRecipeData(body?.id);
    }

    /* ---------------- get recipe list by admin and user ---------- */
    public async getRecipeList(parmas: any, roleId: number, userId: string): Promise<RecipeModel[]> {
        this.log.info(`get recipe list by admin and user`)
        const res = await this.recipeRepository.getRecipeList(parmas, roleId, userId);
        console.log(res, '00')
        const result = res?.map((ele) => {
            return {
                _id: ele?._id?.toString(),
                recipeTitle: ele?.recipeTitle,
                makingDuration: ele?.makingDuration,
                indredient: JSON.parse(ele?.indredient),
                indredientLength: JSON.parse(ele?.indredient)?.length,
                cookingDirection: JSON.parse(ele?.cookingDirection),
                cookingDirectionLength: JSON.parse(ele?.cookingDirection)?.length,
                recipeImage: ele?.recipeImage,
                recipeLikes: (ele?.recipeLikeCount?.length),
                isActive: ele?.isActive,
                isLike: ele?.recipeLike ? ele?.recipeLike?.isLike : null
            }
        })
        return result;
    }

    /* ---------------- get recipe list by admin and user ---------- */
    public async getRecipeListByAdmin(parmas: Filter, roleId: number, userid: string): Promise<Pagination<RecipeModel[]> | any> {
        this.log.info(`get recipe list by admin and user`)
        let res;
        if (roleId == Role.ADMIN)
            res = await this.recipeRepository.getRecipeListByAdmin(parmas, roleId);
        else {
            const userId = new ObjectId(userid);
            res = await this.recipeRepository.getRecipeListByUser(parmas, roleId, userId);
        }
        if (res?.items?.length) {
            (res?.items)?.map((ele) => {
                ele._id = ele?._id?.toString();
                ele['recipeLikes'] = ele?.recipeLike?.length;
                ele['isLike'] = ele?.isRecipeLike ? true : null;
                ele.indredient = JSON.parse(ele?.indredient);
                ele.cookingDirection = JSON.parse(ele?.cookingDirection);
                ele['indredientLength'] = (ele.indredient)?.length;
                ele['cookingDirectionLength'] = (ele.cookingDirection)?.length;
            })
        }
        return res;

    }

    /* ---------------- get recipe data by id  ---------- */
    public async getRecipeDataById(recipeid: string, userid: string): Promise<RecipeModel | any> {
        this.log.info(`get recipe data  by admin and user`)
        const userId = new ObjectId(userid);
        const recipeId = new ObjectId(recipeid);
        let res = await this.recipeRepository.getRecipeDataById(recipeId, userId);
        if (res) {
            res._id = res?._id?.toString();
            res['isLike'] = res?.isRecipeLike ? true : null;
            res['recipeLikes'] = res?.recipeLike?.length;
            res.indredient = JSON.parse(res?.indredient);
            res['indredientLength'] = (res.indredient)?.length;
            res.cookingDirection = JSON.parse(res?.cookingDirection);
            res['cookingDirectionLength'] = (res.cookingDirection)?.length;
        }
        return res;

    }

}