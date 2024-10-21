import { Service } from "typedi";
import { BmiRepository } from "../repositories/BmiRepository";
import { OrmRepository } from "typeorm-typedi-extensions";
import { BmiModel } from "../models/BmiModel";
import { LoggerInterface } from "../../lib/logger";
import { Logger } from "../../decorators/Logger";
import { ObjectId } from 'mongodb'

@Service()
export class BmiService {

    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private bmiRepository: BmiRepository,
    ) { }

    /* ----------------------- bmi info by id -------------- */
    public async bmiInfoById(userid: string, res: any): Promise<BmiModel> {
        this.log.info(`get bmi info by id`)
        const userId = new ObjectId(userid);
        const result = await this.bmiRepository.bmiInfoById(userId);
        if (result) {
            result._id = result?._id?.toString()
            result.userId = result?.userId?.toString()
            return result;
        };
        return res.status(200).send({ success: true, MESSAGE: 'NO_DATA_FOUND' });
    }

    /* ------------------ add booking by user ------------------ */
    public async addBmi(body: any): Promise<BmiModel> {
        this.log.info(`add bmi by user ${body}`);
        const userId = new ObjectId(body?.userId);
        body.userId = userId
        const isExist = await this.bmiRepository.isExistBmiOfDay(body?.userId);
        if (isExist) {
            const date = new Date();
            let currentDate = date.getDate();
            let currentMonth = date.getMonth()
            let currentYear = date.getFullYear();
            let currentData = [currentDate, currentMonth, currentYear].join("-")
            let getDate = isExist?.createdAt?.getDate();
            let getMonth = isExist?.createdAt?.getMonth();
            let getYear = isExist?.createdAt?.getFullYear()
            let getData = [getDate, getMonth, getYear].join("-")
            if (currentData == getData) {
                isExist.height = body?.height;
                isExist.weight = body?.weight;
                isExist.age = body?.age;
                let result = await this.bmiRepository.save(isExist);
                result._id = result._id?.toString();
                result.userId = result?.userId?.toString()
                return result;
            }
        }
        let response = await this.bmiRepository.save(body);
        response._id = response._id?.toString();
        response.userId = response?.userId?.toString()
        return response;
    }
}