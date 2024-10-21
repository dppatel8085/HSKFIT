import { Authorized, Body, Get, JsonController, Param, Post, QueryParams, Req, UseBefore } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Service } from "typedi";
import { DecodeTokenService } from "../services/DecodeTokenService";
import { MealPictureService } from "../services/MealPictureService";
import { UserRoles } from "../enums/Users";
import { MealPictureModel } from "../models/MealPictureModel";
import { fileUploadOptions } from "../fileUpload";
import { env } from "../../env";
import multer from 'multer';
import { validateOrReject } from "class-validator";
import { MealPictureReq } from "./requests/MealPicture";
import { Filter } from "./requests/User";

@OpenAPI({ security: [{ bearerAuth: [] }] })
@JsonController('/meal-picture')

export class MealPictureController {
    constructor(
        @Service() private mealPictureService: MealPictureService,
        @Service() private decodeTokenService: DecodeTokenService
    ) {
    }

    @Authorized([UserRoles.ADMIN,UserRoles.DIETITIAN])
    @Get('/:id')
    @ResponseSchema(MealPictureModel, {
        description: ' get meal data of the user'
    })
    public async mealDataUser(@Param('id') id: string, @QueryParams() param: Filter): Promise<MealPictureModel[]> {
        return await this.mealPictureService.mealDataUser(id, param)
    }

    @Authorized(UserRoles.USER)
    @Post('/')
    @UseBefore(multer(fileUploadOptions).fields([
        { maxCount: 5, name: 'mealImage' },
    ]))
    @ResponseSchema(MealPictureModel, {
        contentType: 'multipart/form-data',
        description: 'add meal picture',
    })
    public async addMealPicture(@Body() body: MealPictureReq, @Req() req: MealPictureReq): Promise<MealPictureModel | any> {
        if (req['files']?.mealImage?.length) {
            body.mealImage = req['files']?.mealImage.map((ele) => {
                return env.app.schema + '://' + req.headers['host'] + '/uploads/' + ele?.filename;
            })
        }
        await validateOrReject(body);
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization'])
        body.userId = decodedToken?._id;
        return await this.mealPictureService.addMealPicture(body)
    }

}