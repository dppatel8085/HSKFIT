import { Authorized, Body, Get, JsonController, Post, QueryParams, Req } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Service } from "typedi";
import { WeightTrackerService } from "../services/WeightTrackerService";
import { UserRoles } from "../enums/Users";
import { WeightTrackerModel } from "../models/WeightTrackerModel";
import { DecodeTokenService } from "../services/DecodeTokenService";
import { WeightTrackerReq } from "./requests/WeightTracker";
import { validateOrReject } from "class-validator";
import { Filter } from "./requests/User";

@OpenAPI({ security: [{ bearerAuth: [] }] })
@JsonController('/weight-tracker')

export class WeightTrackerController {
    constructor(
        @Service() private weightTrackerService: WeightTrackerService,
        @Service() private decodeTokenService: DecodeTokenService
    ) {
    }

    @Authorized(UserRoles.USER)
    @Get('/')
    @ResponseSchema(WeightTrackerModel, {
        description: 'calculate weight'
    })
    public async getWeight(@QueryParams() param: Filter, @Req() req: any): Promise<WeightTrackerModel> {
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization'])
        return await this.weightTrackerService.getWeight(param, decodedToken?._id)
    }

    @Authorized(UserRoles.USER)
    @Post('/')
    @ResponseSchema(WeightTrackerModel, {
        description: 'add weight tracking by user'
    })
    public async addWeigthTracker(@Body() body: WeightTrackerReq, @Req() req: WeightTrackerReq): Promise<WeightTrackerModel> {
        await validateOrReject(body);
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization'])
        body.userId = decodedToken?._id;
        return await this.weightTrackerService.addWeigthTracker(body)
    }

}