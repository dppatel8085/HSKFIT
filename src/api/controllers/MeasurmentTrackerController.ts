import { Authorized, Body, Get, JsonController, Post, QueryParams, Req } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Service } from "typedi";
import { UserRoles } from "../enums/Users";
import { DecodeTokenService } from "../services/DecodeTokenService";
import { validateOrReject } from "class-validator";
import { MeasurmentTrackerService } from "../services/MeasurmentTrackerService";
import { MeasurmentTrackerModel } from "../models/MeasurmentTrackerModel";
import { MeasurmentReqest } from "./requests/Measurment";
import { Filter } from "./requests/User";

@OpenAPI({ security: [{ bearerAuth: [] }] })
@JsonController('/measurment-tracker')

export class MeasurmentTrackerController {
    constructor(
        @Service() private measurmentTrackerService: MeasurmentTrackerService,
        @Service() private decodeTokenService: DecodeTokenService
    ) {
    }

    @Authorized(UserRoles.USER)
    @Get('/')
    @ResponseSchema(MeasurmentTrackerModel, {
        description: 'get measurment data'
    })
    public async getMeasurmentData(@QueryParams() param: Filter, @Req() req: any): Promise<MeasurmentTrackerModel[]> {
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization'])
        return await this.measurmentTrackerService.getMeasurmentData(param, decodedToken?._id)
    }

    @Authorized(UserRoles.USER)
    @Post('/')
    @ResponseSchema(MeasurmentTrackerModel, {
        description: 'add measurment by user'
    })
    public async addMeasurment(@Body() body: MeasurmentReqest, @Req() req: MeasurmentReqest): Promise<MeasurmentTrackerModel> {
        await validateOrReject(body);
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization'])
        body.userId = decodedToken?._id;
        return await this.measurmentTrackerService.addMeasurment(body)
    }

}