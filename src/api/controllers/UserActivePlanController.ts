import { Authorized, Body, JsonController, Post } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Service } from "typedi";
import { UserActivePlanService } from "../services/UserActivePlanService";
import { UserRoles } from "../enums/Users";
import { UserActivePlanModel } from "../models/UserActivePlanModel";

@OpenAPI({ security: [{ bearerAuth: [] }] })
@JsonController('/user-active-plan')

export class UserActivePlanController {
    constructor(
        @Service() private userActivePlanService: UserActivePlanService,
    ) {
    }

    @Authorized(UserRoles.ADMIN)
    @Post('/')
    @ResponseSchema(UserActivePlanModel, {
        description: ' add user active plan'
    })
    public async addPlanByUser(@Body() body: any): Promise<UserActivePlanModel> {
        return await this.userActivePlanService.assignPlanByUser(body)
    }

}