import { Authorized, Body, Get, JsonController, Patch, Post, Res } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Service } from "typedi";
import { ConfigurationService } from "../services/ConfigurationService";
import { UserRoles } from "../enums/Users";
import { ConfigurationModel } from "../models/ConfigurationModel";
import { ConfigurationRequest } from "./requests/Configuration";
import { ConfigurationResponse } from "./respons/Configuration";
import { validateOrReject } from "class-validator";
import { Response } from "express";

@OpenAPI({ security: [{ bearerAuth: [] }] })
@JsonController('/configuration')

export class ConfigurationController {
    constructor(
        @Service() private configurationService: ConfigurationService,
    ) {
    }

    @Authorized([UserRoles.ADMIN, UserRoles.DIETITIAN, UserRoles.USER])
    @Get('/')
    @ResponseSchema(ConfigurationModel, {
        description: 'configuration info ',
    })
    public async configurationInfo(): Promise<ConfigurationModel[]> {
        return await this.configurationService.configurationInfo();
    }

    @Authorized(UserRoles.ADMIN)
    @Post('/')
    @ResponseSchema(ConfigurationRequest, {
        description: 'add configuration by admin'
    })
    public async addConfiguration(@Body() body: ConfigurationRequest,@Res() res:Response): Promise<ConfigurationModel> {
        await validateOrReject(body);
        return await this.configurationService.addConfiguration(body,res)
    }

    /*  ------------------update configuration by admin ---------------  */
    @Authorized(UserRoles.ADMIN)
    @Patch('/')
    @ResponseSchema(ConfigurationRequest, {
        description: ' update configuration by admin',
    })
    public async updateConfiguration(@Body() body: ConfigurationResponse, @Res() res: ConfigurationResponse): Promise<ConfigurationModel | {}> {
        return await this.configurationService.updateConfiguration(body, res);
    }


}