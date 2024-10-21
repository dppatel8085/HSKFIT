import { Logger, LoggerInterface } from "../../decorators/Logger";
import { Service } from "typedi";
import { QuestionRepository } from "../repositories/QuestionRepository";
import { OrmRepository } from "typeorm-typedi-extensions";
import { QuestionModel } from "../models/QuestionModel";


@Service()
export class QuestionService {
    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private QuestionRepository: QuestionRepository,
    ) { }

    /* ------------------ add measurment tracker by user------------------ */
    public async addQuestion(body: any): Promise<QuestionModel> {
        this.log.info(`add measurment tracker by user ${body}`)
        body.value = JSON.stringify(body?.value);
        const res = await this.QuestionRepository.save(body);
        res._id = res?._id?.toString()
        res.userId = res?.userId?.toString();
        return res;

    }


}