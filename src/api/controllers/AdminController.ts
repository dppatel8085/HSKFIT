import { Authorized, Body, Delete, Get, JsonController, Param, Patch, Post, QueryParams, Req, Res } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Service } from "typedi";
import { AdminService } from "../services/AdminService";
import { UserRoles } from "../enums/Users";
import { Filter, ForgetRequest, updatePasswordRequest } from "./requests/User";
import { UsersResponse } from "./respons/User";
import { AdminModel } from "../models/AdminModel";
import { DecodeTokenService } from "../services/DecodeTokenService";
import { Pagination } from "nestjs-typeorm-paginate";
import { DietitanReq } from "./requests/Dietitian";
import { validateOrReject } from "class-validator";
import { Response } from 'express';

@OpenAPI({ security: [{ bearerAuth: [] }] })
@JsonController('/admin')

export class AdminController {
    constructor(
        @Service() private adminService: AdminService,
        @Service() private decodeTokenService: DecodeTokenService
    ) {
    }

    @Authorized(UserRoles.ADMIN)
    @Get('/dietitian-list')
    @ResponseSchema(AdminModel, {
        description: 'get dietitian list by admin',
        isArray: true
    })
    public async getDietitans(): Promise<AdminModel[]> {
        return await this.adminService.getDietitans()
    }

    @Authorized(UserRoles.ADMIN)
    @Get('/list')
    @ResponseSchema(AdminModel, {
        description: 'get dietitian list by admin',
        isArray: true
    })
    public async dietitanList(@QueryParams() params: Filter): Promise<Pagination<AdminModel[]>> {
        return await this.adminService.dietitianList(params)
    }

    @Authorized([UserRoles.ADMIN, UserRoles.DIETITIAN])
    @Get('/dietitian-user/:id')
    @ResponseSchema(AdminModel, {
        description: 'user of dietitian by dietitan and admin',
        isArray: true
    })
    public async userOfDietitan(@Param('id') id: string): Promise<AdminModel> {
        return await this.adminService.userOfDietitian(id);
    }

    @Post('/forget-password')
    @ResponseSchema(ForgetRequest, {
        description: 'forget password ',
    })
    public async forgetPassword(@Body() body: ForgetRequest, @Res() res: UsersResponse): Promise<AdminModel | {}> {
        return await this.adminService.forgetPassword(body?.email, res);
    }

    @Authorized(UserRoles.ADMIN)
    @Post('/')
    @ResponseSchema(AdminModel, {
        description: 'create dietitian by admin',
    })
    public async addDietitianByAdmin(@Body() body: DietitanReq, @Req() req: any): Promise<AdminModel> {
        await validateOrReject(body);
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization']);
        body.createdById = decodedToken?._id
        return await this.adminService.addDietitianByAdmin(body);
    }

    @Authorized([UserRoles.ADMIN, UserRoles.DIETITIAN])
    @Patch('/update-password')
    @ResponseSchema(updatePasswordRequest, {
        description: 'update password by admin',
    })
    public async updatePasswordByAdmin(@Body() body: updatePasswordRequest, @Res() res: UsersResponse): Promise<AdminModel | {}> {
        return await this.adminService.updatePasswordByAdmin(body, res);
    }

    @Authorized(UserRoles.ADMIN)
    @Patch('/')
    @ResponseSchema(updatePasswordRequest, {
        description: 'update detail of dietitan by admin',
    })
    public async updateDietianByAdmin(@Body() body: updatePasswordRequest, @Res() res: UsersResponse): Promise<AdminModel | {}> {
        return await this.adminService.updateDietianByAdmin(body, res);
    }

    /*  ------------------ delete dietitan by Admin ---------------  */
    @Authorized(UserRoles.ADMIN)
    @Delete('/:id')
    @ResponseSchema(AdminModel, {
        description: 'delete dietitan by Admin',
    })
    public async deleteDietitian(@Param('id') id: string, @Res() res: Response): Promise<AdminModel> {
        return await this.adminService.deleteDietitian(id, res);
    }

}