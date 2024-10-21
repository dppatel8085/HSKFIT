import { Authorized, Body, Get, JsonController, Param, Post, Req, Res } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Service } from "typedi";
import { BmiService } from "../services/BmiService";
import { UserRoles } from "../enums/Users";
import { BmiModel } from "../models/BmiModel";
import { DecodeTokenService } from "../services/DecodeTokenService";
import { validateOrReject } from "class-validator";
import { BmiReq } from "./requests/Bmi";
import { Response } from 'express';


@OpenAPI({ security: [{ bearerAuth: [] }] })
@JsonController('/bmi')

export class BmiController {
    constructor(
        @Service() private bmiService: BmiService,
        @Service() private decodeTokenService: DecodeTokenService
    ) {
    }
 
    @Authorized(UserRoles.USER)
    @Get('/:id')
    @ResponseSchema(BmiModel, {
        description: 'bmi data by id'
    })
    public async bmiInfoById(@Param('id') id: string, @Res() res: Response): Promise<BmiModel> {
        return await this.bmiService.bmiInfoById(id, res);
    }

    @Authorized(UserRoles.USER)
    @Post('/')
    @ResponseSchema(BmiModel, {
        description: 'add bmi by user'
    })
    public async addBmi(@Body() body: BmiReq, @Req() req: BmiReq): Promise<BmiModel> {
        await validateOrReject(body);
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization'])
        body.userId = decodedToken?._id;
        return await this.bmiService.addBmi(body)
    }


}