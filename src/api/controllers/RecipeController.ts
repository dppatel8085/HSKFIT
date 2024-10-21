import { Authorized, Body, Delete, Get, JsonController, Param, Patch, Post, QueryParams, Req, Res, UseBefore, } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Service } from "typedi";
import { UserRoles } from "../enums/Users";
import { RecipeService } from "../services/RecipeService";
import { RecipeModel } from "../models/RecipeModel";
import { env } from "../../env";
import multer from 'multer';
import { fileUploadOptions } from "../fileUpload";
import { DecodeTokenService } from "../services/DecodeTokenService";
import { RecipeReq } from "./requests/Recipe";
import { validateOrReject } from "class-validator";
import { Pagination } from "nestjs-typeorm-paginate";
import { RecipeRes } from "./respons/Recipe";
import { Filter } from "./requests/User";
import { Response } from "express";

@OpenAPI({ security: [{ bearerAuth: [] }] })
@JsonController('/recipe')

export class RecipeController {
    constructor(
        @Service() private recipeService: RecipeService,
        @Service() private decodeTokenService: DecodeTokenService
    ) {
    }

    @Authorized([UserRoles.ADMIN, UserRoles.USER])
    @Get('/get-by-id/:id')
    @ResponseSchema(RecipeModel, {
        description: 'get recipe data by user and admin',
    })
    public async recipeDataById(@Param('id') id:string, @Req() req: any): Promise<RecipeModel> {
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization'])
        return await this.recipeService.getRecipeDataById(id,decodedToken?._id)
    }


    @Authorized([UserRoles.ADMIN, UserRoles.USER])
    @Get('/list')
    @ResponseSchema(RecipeModel, {
        description: 'get recipe list by user and admin',
        isArray: true
    })
    public async recipeList(@QueryParams() params: Filter, @Req() req: any): Promise<Pagination<RecipeModel[]>> {
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization'])
        return await this.recipeService.getRecipeListByAdmin(params, decodedToken['role'],decodedToken?._id)
    }

    @Authorized(UserRoles.ADMIN)
    @Post('/')
    @UseBefore(multer(fileUploadOptions).fields([
        { maxCount: 1, name: 'recipeImage' },
    ]))
    @ResponseSchema(RecipeModel, {
        contentType: 'multipart/form-data',
        description: 'edit user profile',
    })
    public async addRecipe(@Body() body: RecipeReq, @Req() req: RecipeReq): Promise<RecipeModel> {
        if (req['files']?.recipeImage) {
            body.recipeImage = env.app.schema + '://' + req.headers['host'] + '/uploads/' + req['files']?.recipeImage[0].filename;
        }
        await validateOrReject(body);
        return await this.recipeService.addRecipe(body)
    }


    @Authorized(UserRoles.ADMIN)
    @Patch('/')
    @UseBefore(multer(fileUploadOptions).fields([
        { maxCount: 1, name: 'recipeImage' },
    ]))
    @ResponseSchema(RecipeModel, {
        contentType: 'multipart/form-data',
        description: 'edit recipe by admin',
    })
    public async editRecipe(@Body() body: RecipeRes, @Req() req: RecipeReq): Promise<RecipeModel> {
        if (req['files']?.recipeImage) {
            body.recipeImage = env.app.schema + '://' + req.headers['host'] + '/uploads/' + req['files']?.recipeImage[0].filename;
        }
        return await this.recipeService.editRecipe(body);
    }

    /*  ------------------ delete recipe by Admin ---------------  */
    @Authorized(UserRoles.ADMIN)
    @Delete('/:id')
    @ResponseSchema(RecipeModel, {
        description: ' delete recipe by Admin',
    })
    public async deleteRecipe(@Param('id') id: string, @Res() res: Response): Promise<RecipeModel> {
        return await this.recipeService.deleteRecipe(id, res);
    }
}