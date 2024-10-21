import { Body, JsonController, Post, Res } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Service } from "typedi";
import { RecipeLikeService } from "../services/RecipeLikeService";
import { RecipeLikeModel } from "../models/recipeLikeModel";
import { RecipeRequest } from "./requests/RecipeLike";
import { validateOrReject } from "class-validator";

@OpenAPI({ security: [{ bearerAuth: [] }] })
@JsonController('/recipe-like')

export class StoriesController {
    constructor(
        @Service() private recipeLikeService: RecipeLikeService,
    ) {
    }

    @Post('/')
    @ResponseSchema(RecipeLikeModel, {
        description: ' add recipe like by user'
    })
    public async addRecipeLike(@Body() body: RecipeRequest, @Res() res: RecipeRequest): Promise<RecipeLikeModel> {
        await validateOrReject(body)
        return await this.recipeLikeService.addRecipeLike(body, res)
    }
}