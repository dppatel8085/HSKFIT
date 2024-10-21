import { Service } from "typedi";
import { Logger, LoggerInterface } from "../../decorators/Logger";
import { WaterTrackerModel } from "../models/WaterTrackerModel";
import { WaterTrackerRepository } from "../repositories/WaterTrackerRepository";
import { OrmRepository } from "typeorm-typedi-extensions";
import { ObjectId } from 'mongodb'

@Service()
export class WaterTrackerService {
    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private waterTrackerRepository: WaterTrackerRepository
    ) { }

    /* ----------------------- water tracker info by id -------------- */
    public async waterInfoById(res: any, userid: string): Promise<WaterTrackerModel> {
        this.log.info(`get water info of the day`)
        const userId = new ObjectId(userid);
        const result = await this.waterTrackerRepository.waterInfoById(userId);
        if (result) {
            result._id = result?._id?.toString();
            result.userId = result?.userId?.toString()
            return result;
        }
        return res.status(200).send({ success: true, MESSAGE: 'NO_DATA_FOUND' });
    }

    /* ----------------------- water tracker info by id -------------- */
    public async waterInfoAtHome(userId: string, res: any): Promise<WaterTrackerModel> {
        this.log.info(`get water info of the day`)
        const result = await this.waterTrackerRepository.waterInfoById(ObjectId(userId));
        if (result) {
            result._id = result?._id?.toString();
            result.userId = result?.userId?.toString()
            return result;
        }
        return null;
    }

    /* ------------------ add water tracker by user------------------ */
    public async addWaterTracker(body: any): Promise<WaterTrackerModel> {
        this.log.info(`add water tracker by user ${body}`)
        const userId = new ObjectId(body?.userId);
        body.userId = userId
        const isWeightTrackerExist = await this.waterTrackerRepository.lastDataAddWater(body?.userId);
        if (isWeightTrackerExist) {
            let date = new Date();
            let currentMonth = date.getMonth();
            let currentDate = date.getDate();
            let cuurentYear = date.getFullYear();
            const newDate = [currentDate, currentMonth, cuurentYear].join("-")
            let getDate = isWeightTrackerExist?.createdAt.getDate();
            let getMonth = isWeightTrackerExist?.createdAt.getMonth();
            let getFullYear = isWeightTrackerExist?.createdAt.getFullYear();
            const recieveDate = [getDate, getMonth, getFullYear].join("-");
            if (newDate == recieveDate) {
                isWeightTrackerExist.result = body?.result;
                isWeightTrackerExist.waterInGlass = body?.waterInGlass;
                const result = await this.waterTrackerRepository.save(isWeightTrackerExist);
                result._id = result._id?.toString();
                result.userId = result?.userId?.toString()
                return result;
            }
        }
        const res = await this.waterTrackerRepository.save({ userId: body.userId, waterInGlass: body?.waterInGlass, result: body?.result });
        res._id = res?._id?.toString();
        res.userId = res?.userId?.toString();
        return res;
    }


}