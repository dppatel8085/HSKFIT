import { Authorized, Body, Get, JsonController, Param, Post, Req, Res } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Service } from "typedi";
import { WaterTrackerService } from "../services/WaterTrackerService";
import { DecodeTokenService } from "../services/DecodeTokenService";
// import { UserRoles } from "../enums/Users";
// import { WaterTrackerModel } from "../models/WaterTrackerModel";
import { WaterTrackerReq } from "./requests/WaterTracker";
import { UserRoles } from "../enums/Users";
import { validateOrReject } from "class-validator";
// import { validateOrReject } from "class-validator";
// import { Response } from "express";

@OpenAPI({ security: [{ bearerAuth: [] }] })
@JsonController('/water-tracker')

export class WaterTrackerController {
    constructor(
        @Service() private waterTrackerService: WaterTrackerService,
        @Service() private decodeTokenService: DecodeTokenService
    ) {
    }

    @Authorized(UserRoles.USER)
    @Get('/:id')
    @ResponseSchema('any', {
        description: 'how much water take of the day'
    })
    public async waterInfoById(@Param('id') id:string ,@Res() res: any) {
        return await this.waterTrackerService.waterInfoById(res,id);
    }

    @Authorized(UserRoles.USER)
    @Post('/')
    @ResponseSchema('a', {
        description: 'add water tracking by user'
    })
    public async addWaterTracker(@Body() body: WaterTrackerReq, @Req() req: WaterTrackerReq): Promise<any> {
        await validateOrReject(body);
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization'])
        body.userId = decodedToken?._id;
        return await this.waterTrackerService.addWaterTracker(body)
    }

}