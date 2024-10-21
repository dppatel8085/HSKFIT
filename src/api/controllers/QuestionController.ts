import { Authorized, Body, JsonController, Post, Req } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Service } from "typedi";
import { QuestionService } from "../services/QuestionService";
import { UserRoles } from "../enums/Users";
import { QuestionModel } from "../models/QuestionModel";
import { DecodeTokenService } from "../services/DecodeTokenService";

@OpenAPI({ security: [{ bearerAuth: [] }] })
@JsonController('/question')

export class QuestionController {
    constructor(
        @Service() private questionService: QuestionService,
        @Service() private decodeTokenService: DecodeTokenService
    ) {
    }

    @Authorized(UserRoles.USER)
    @Post('/')
    @ResponseSchema(QuestionModel, {
        description: ' add question by user'
    })
    public async addQuestion(@Body() body: any, @Req() req: any): Promise<QuestionModel> {
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization'])
        body.userId = decodedToken._id
        return await this.questionService.addQuestion(body)
    }
}