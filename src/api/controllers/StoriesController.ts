import { Authorized, Body, Delete, Get, JsonController, Param, Patch, Post, QueryParams, Req, Res, UseBefore } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Service } from "typedi";
import { StoriesService } from "../services/StoriesService";
import { UserRoles } from "../enums/Users";
import { StoriesModel } from "../models/StoriesModel";
import { env } from "../../env";
import multer from 'multer';
import { multipleImgUploadOptionsWithColumn } from "../fileUpload";
import { DecodeTokenService } from "../services/DecodeTokenService";
import { Pagination } from "nestjs-typeorm-paginate";
import { StoriesReq } from "./requests/Stories";
import { validateOrReject } from "class-validator";
import { StoriesRes } from "./respons/Stories";
import { Filter } from "./requests/User";
import { Response } from "express";

@OpenAPI({ security: [{ bearerAuth: [] }] })
@JsonController('/stories')

export class StoriesController {
    constructor(
        @Service() private storiesService: StoriesService,
        @Service() private decodeTokenService: DecodeTokenService
    ) {
    }

    @Authorized([UserRoles.ADMIN, UserRoles.USER])
    @Get('/list')
    @ResponseSchema(StoriesModel, {
        description: 'stories list for admin and user',
        isArray: true
    })
    public async storiesList(@QueryParams() params: Filter, @Req() req: any): Promise<Pagination<StoriesModel[]>> {
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization'])
        return await this.storiesService.storiesListByAdmin(params, decodedToken?.role);
    }


    @Authorized(UserRoles.ADMIN)
    @Post('/')
    @UseBefore(multer(multipleImgUploadOptionsWithColumn).fields([
        { maxCount: 1, name: 'storiesImage' },
        { maxCount: 1, name: 'storyViewImg' }
    ]))
    @ResponseSchema(StoriesModel, {
        contentType: 'multipart/form-data',
        description: 'add stories by admin',
    })
    public async addStory(@Body() body: StoriesReq, @Req() req: StoriesReq): Promise<StoriesModel> {
        const files = req['files'];
        if (files) {
            body.storiesImage = env.app.schema + '://' + req.headers['host'] + '/uploads/' + req['files']?.storiesImage[0].filename;
            body.storyViewImg = env.app.schema + '://' + req.headers['host'] + '/uploads/' + req['files']?.storyViewImg[0].filename;
        }
        await validateOrReject(body)
        return await this.storiesService.addStory(body);
    }

    @Authorized(UserRoles.ADMIN)
    @Patch('/')
    @UseBefore(multer(multipleImgUploadOptionsWithColumn).fields([
        { maxCount: 1, name: 'storiesImage' },
        { maxCount: 1, name: 'storyViewImg' }
    ]))
    @ResponseSchema(StoriesModel, {
        contentType: 'multipart/form-data',
        description: 'update stories by admin',
    })
    public async updateStory(@Body() body: StoriesRes, @Req() req: StoriesRes): Promise<StoriesModel> {
        if (req['files'].storiesImage)
            body.storiesImage = env.app.schema + '://' + req.headers['host'] + '/uploads/' + req['files']?.storiesImage[0].filename;
        if (req['files'].storyViewImg)
            body.storyViewImg = env.app.schema + '://' + req.headers['host'] + '/uploads/' + req['files']?.storyViewImg[0].filename;
        return await this.storiesService.updateStory(body);
    }

    @Authorized(UserRoles.ADMIN)
    @Delete('/:id')
    @ResponseSchema(StoriesModel, {
        description: ' delete story by admin'
    })
    public async deleteStoryByAdmin(@Param('id') id: string, @Res() res: Response): Promise<StoriesModel> {
        return await this.storiesService.deleteStoryByAdmin(id, res);
    }

}