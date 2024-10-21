import { Logger, LoggerInterface } from "../../decorators/Logger";
import { Service } from "typedi";
import { OrmRepository } from "typeorm-typedi-extensions";
import { MeasurmentTrackerModel } from "../models/MeasurmentTrackerModel";
import { MeasurmentTrackerRepository } from "../repositories/MeasurmentTrackerRepository";
import { MeasurmentReqest } from "../controllers/requests/Measurment";
import { Filter } from "../controllers/requests/User";
import { ObjectId } from 'mongodb'

@Service()
export class MeasurmentTrackerService {
    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private measurmentTrackerRepository: MeasurmentTrackerRepository,
    ) { }

    /* ------------------ add measurment tracker by user------------------ */
    public async addMeasurment(body: MeasurmentReqest): Promise<MeasurmentTrackerModel> {
        this.log.info(`add measurment tracker by user ${body}`)
        const userId = new ObjectId(body?.userId);
        body.userId = userId;
        const lastMeasurmentTrackerData = await this.measurmentTrackerRepository.lastMeasurmentTrackerData(body?.userId);
        if (lastMeasurmentTrackerData) {
            let date = new Date();
            let currentMonth = date.getMonth();
            let currentDate = date.getDate();
            let cuurentYear = date.getFullYear();
            const newDate = [currentDate, currentMonth, cuurentYear].join("-")
            let getDate = lastMeasurmentTrackerData?.createdAt.getDate();
            let getMonth = lastMeasurmentTrackerData?.createdAt.getMonth();
            let getFullYear = lastMeasurmentTrackerData?.createdAt.getFullYear();
            const recieveDate = [getDate, getMonth, getFullYear].join("-");
            if (newDate == recieveDate) {
                lastMeasurmentTrackerData.arm = body?.arm;
                lastMeasurmentTrackerData.chest = body?.chest;
                lastMeasurmentTrackerData.hips = body?.hips;
                lastMeasurmentTrackerData.waist = body?.waist;
                lastMeasurmentTrackerData.thigh = body?.thigh;
                const result = await this.measurmentTrackerRepository.save(lastMeasurmentTrackerData);
                result._id = result._id?.toString();
                result.userId = result?.userId?.toString()
                return result;
            }
        }
        let res = await this.measurmentTrackerRepository.save(body);
        res._id = res._id?.toString();
        res.userId = res.userId?.toString();
        return res;

    }

    /* ------------------------ get measurment tracker data ------------------ */
    public async getMeasurmentData(param: Filter, userid: string): Promise<MeasurmentTrackerModel[]> {
        const userId = new ObjectId(userid);
        const res = await this.measurmentTrackerRepository.getMeasurmentData(param, userId);
        if (res[0] == null) return [];
        return res;
    }


}