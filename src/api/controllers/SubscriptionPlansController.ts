import { Authorized, Body, Delete, Get, JsonController, Param, Patch, Post, QueryParams, Req, Res } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { SubsCriptionPlansService } from "../services/SubsCriptionPlansService";
import { Service } from "typedi";
import { UserRoles } from "../enums/Users";
import { SubsCriptionPlansModel } from "../models/SubscriptionPlansModel";
import { Filter } from "./requests/User";
import { DecodeTokenService } from "../services/DecodeTokenService";
import { SubsCriptionReq } from "./requests/SubsCriptionPlan";
import { validateOrReject } from "class-validator";
import { SubsCriptionRes } from "./respons/SubsCriptionPlan";
import { Response } from "express";

@OpenAPI({ security: [{ bearerAuth: [] }] })
@JsonController('/subscription-plan')

export class SubsCriptionController {
    constructor(
        @Service() private subsCriptionPlansService: SubsCriptionPlansService,
        @Service() private decodeTokenService: DecodeTokenService
    ) {
    }

    @Authorized([UserRoles.ADMIN, UserRoles.USER])
    @Get('/list')
    @ResponseSchema(SubsCriptionPlansModel, {
        description: 'plans list for admin and user',
        isArray: true
    })
    public async subsCriptionPlanList(@QueryParams() params: Filter, @Req() req: any): Promise<SubsCriptionPlansModel[]> {
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization'])
        return await this.subsCriptionPlansService.subsCriptionPlanList(params, decodedToken?.role);
    }

    @Authorized(UserRoles.ADMIN)
    @Post('/')
    @ResponseSchema(SubsCriptionPlansModel, {
        description: 'add subcription plan by admin'
    })
    public async addSubscriptionPlan(@Body() body: SubsCriptionReq): Promise<SubsCriptionPlansModel> {
        await validateOrReject(body);
        return await this.subsCriptionPlansService.addSubscriptionPlan(body)
    }

    /*  ------------------update plan by admin ---------------  */
    @Authorized(UserRoles.ADMIN)
    @Patch('/')
    @ResponseSchema(SubsCriptionPlansModel, {
        description: 'update  plan by admin',
    })
    public async updatePlan(@Body() body: SubsCriptionRes): Promise<SubsCriptionPlansModel | {}> {
        return await this.subsCriptionPlansService.updatePlan(body);
    }

    /*  ------------------ delete plan by Admin ---------------  */
    @Authorized(UserRoles.ADMIN)
    @Delete('/:id')
    @ResponseSchema(SubsCriptionPlansModel, {
        description: 'delete plan by Admin',
    })
    public async deletePlan(@Param('id') id: string, @Res() res: Response): Promise<SubsCriptionPlansModel> {
        return await this.subsCriptionPlansService.deletePlan(id, res);
    }
}