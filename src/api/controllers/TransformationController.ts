import { Authorized, Body, Delete, Get, JsonController, Param, Patch, Post, QueryParams, Req, Res, UseBefore } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Service } from "typedi";
import { TransformationService } from "../services/TransformationService";
import { UserRoles } from "../enums/Users";
import { DecodeTokenService } from "../services/DecodeTokenService";
import { TransformationModel } from "../models/TransformationModel";
import { env } from "../../env";
import multer from 'multer';
import { fileUploadOptions } from "../fileUpload";
import { Pagination } from "nestjs-typeorm-paginate";
import { TransformationReq } from "./requests/Transformation";
import { validateOrReject } from "class-validator";
import { TransformationRes } from "./respons/Transformation";
import { Filter } from "./requests/User";
import { Response } from "express";

@OpenAPI({ security: [{ bearerAuth: [] }] })
@JsonController('/transformation')

export class TransformationController {
    constructor(
        @Service() private transformationService: TransformationService,
        @Service() private decodeTokenService: DecodeTokenService
    ) {
    }

    @Authorized([UserRoles.ADMIN, UserRoles.USER])
    @Get('/get-by-id/:id')
    @ResponseSchema(TransformationModel, {
        description: 'get transformation data by id',
        isArray: true
    })
    public async transformationById(@Param('id') id: string, @Req() req: any): Promise<TransformationModel> {
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization'])
        return await this.transformationService.transformationById(id, decodedToken?._id)
    }

    @Authorized([UserRoles.ADMIN, UserRoles.USER])
    @Get('/list')
    @ResponseSchema(TransformationModel, {
        description: 'get transformation list by user and admin',
        isArray: true
    })
    public async transformationList(@QueryParams() params: Filter, @Req() req: any): Promise<Pagination<TransformationModel[]>> {
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization'])
        return await this.transformationService.transformationList(params, decodedToken['role'], decodedToken?._id)
    }

    @Authorized(UserRoles.ADMIN)
    @Post('/')
    @UseBefore(multer(fileUploadOptions).fields([
        { maxCount: 1, name: 'image' },
    ]))
    @ResponseSchema(TransformationModel, {
        contentType: 'multipart/form-data',
        description: 'add transformation by admin',
    })
    public async addTransformation(@Body() body: TransformationReq, @Req() req: TransformationReq): Promise<TransformationModel> {
        if (req['files']?.image) {
            body.image = env.app.schema + '://' + req.headers['host'] + '/uploads/' + req['files']?.image[0].filename;
        }
        await validateOrReject(body);
        return await this.transformationService.addTransformation(body)
    }


    @Authorized(UserRoles.ADMIN)
    @Patch('/')
    @UseBefore(multer(fileUploadOptions).fields([
        { maxCount: 1, name: 'image' },
    ]))
    @ResponseSchema(TransformationModel, {
        contentType: 'multipart/form-data',
        description: 'edit transformation by admin',
    })
    public async editTransformation(@Body() body: TransformationRes, @Req() req: TransformationReq): Promise<TransformationModel> {
        if (req['files']?.image) {
            body.image = env.app.schema + '://' + req.headers['host'] + '/uploads/' + req['files']?.image[0].filename;
        }
        return await this.transformationService.editTransformation(body);
    }

    /*  ------------------ delete transformation by Admin ---------------  */
    @Authorized(UserRoles.ADMIN)
    @Delete('/:id')
    @ResponseSchema(TransformationModel, {
        description: ' delete transformation by Admin',
    })
    public async deleteTransformation(@Param('id') id: string, @Res() res: Response): Promise<TransformationModel> {
        return await this.transformationService.deleteTransformation(id, res);
    }

}