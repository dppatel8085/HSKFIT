import {  Authorized, Body, JsonController, Post, Req, Res, UseBefore } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Service } from "typedi";
import { DietPlanService } from "../services/DietPlanService";
import { DecodeTokenService } from "../services/DecodeTokenService";
import { DietPlanModel } from "../models/DietPlanModel";
import multer from 'multer';
import { fileUploadExcel } from "../fileUpload";
import XLSX from 'xlsx'
import { UserRoles } from "../enums/Users";

@OpenAPI({ security: [{ bearerAuth: [] }] })
@JsonController('/diet-plan')

export class DietPlanController {
    constructor(
        @Service() private dietPlanService: DietPlanService,
        @Service() private decodeTokenService: DecodeTokenService
    ) {
    }

    @Authorized(UserRoles.DIETITIAN)
    @Post('/upload-excel')
    @UseBefore(multer(fileUploadExcel).single('excelFile'))
    @ResponseSchema(DietPlanModel, {
        description: 'add diet plan by dietitan'
    })
    public async addExcelData(@Body() body: any, @Req() req: any, @Res() res: any): Promise<DietPlanModel> {
        const excelFile = req.file;
        if (!excelFile)
            return res.status(400).send({ success: false, MESSAGE: 'EXCEL_FILE_NOT_PROVIDED' })
        const workbook = XLSX.readFile(excelFile.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const excelData = XLSX.utils.sheet_to_json(worksheet) as any[];
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization'])
        return await this.dietPlanService.addExcel(excelData, decodedToken?._id, body.userId, res);
    }

}