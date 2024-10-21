import {  Authorized, Body, JsonController , Post, Req } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Service } from "typedi";
import { FollowUpMsgService } from "../services/FollowUpMsgService";
import { FollowUpMsgModel } from "../models/FollowUpMsgModel";
import { DecodeTokenService } from "../services/DecodeTokenService";
import { UserRoles } from "../enums/Users";
import { FollowUpReq } from "./requests/FollowUp";
import { validateOrReject } from "class-validator";

@OpenAPI({ security: [{ bearerAuth: [] }] })
@JsonController('/follow-up-msg')

export class FollowUpMsgController {
    constructor(
        @Service() private followUpMsgService: FollowUpMsgService,
        @Service() private decodeTokenService: DecodeTokenService
    ) { }

    @Authorized([UserRoles.DIETITIAN,UserRoles.ADMIN])
    @Post()
    @ResponseSchema(FollowUpMsgModel, {
        description: 'add follow up msg'
    })
    public async addfollowUpMsg(@Body() body: FollowUpReq, @Req() req: FollowUpReq): Promise<FollowUpMsgModel> {
        await validateOrReject(body);
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization']);
        body.dietitianId = decodedToken?._id;
        return await this.followUpMsgService.addFollowUpMsg(body);
    }


}