import { Logger, LoggerInterface } from "../../decorators/Logger";
import { Service } from "typedi";
import { DietPlanRepository } from "../repositories/DietPlanRepository";
import { OrmRepository } from "typeorm-typedi-extensions";
import { DietPlanModel } from "../models/DietPlanModel";
import { ObjectId } from 'mongodb'

@Service()
export class DietPlanService {

    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private dietPlanRepository: DietPlanRepository,
    ) { }

    public async addExcel(data: any, dietitianId: number, userid, res): Promise<DietPlanModel | any> {
        this.log.info(`get fiet plan list by user and dietitan,${userid}`)
        let mealInclude, mealExclude = '', excelData = [];
        let userId = new ObjectId(userid)
        const isExistUserId = await this.dietPlanRepository.findOne({ userId: userId });
        if (isExistUserId) await this.dietPlanRepository.delete({ userId: userId });
        let previousDays = '';
        await Promise.all(data.map((ele, index) => {
            ele.days = (ele?.days)?.trim();
            const day = ele?.days ? this.gfg((ele.days).toLowerCase()) : 0;
            if (day > 0) {
                previousDays = ele.days;
                data[index]['days'] = previousDays;
            } else {
                ele.days = previousDays;
            }
            mealInclude = JSON.stringify((ele?.mealinclude || "").split(","));
            mealExclude = ele?.mealexclude ? JSON.stringify((ele?.mealexclude).split(",")) : mealExclude;
            excelData.push({
                userId: userId,
                days: ele.days,
                dietitianId: dietitianId,
                mealIncluded: mealInclude,
                mealExcluded: mealExclude,
                time: ele?.time,
                isActive:true
            })
            return Promise.resolve(ele);
        }))
        await this.dietPlanRepository.save(excelData);
        return res.status(200).send({ success: true, MESSAGE: 'SUCCESSFULLY_ADD_EXCEL' })
    }

    public gfg(stringDay: any) {
        switch (`${stringDay}`) {
            case 'monday': {
                return (stringDay.match(/monday/g) ?? []).length;
            }
            case 'tuesday': {
                return (stringDay.match(/tuesday/g) ?? []).length;
            }
            case 'wednesday': {
                return (stringDay.match(/wednesday/g) ?? []).length;
            }
            case 'thursday': {
                return (stringDay.match(/thursday/g) ?? []).length;
            }
            case 'friday': {
                return (stringDay.match(/friday/g) ?? []).length;
            }
            case 'saturday': {
                return (stringDay.match(/saturday/g) ?? []).length;
            }
            case 'sunday': {
                return (stringDay.match(/sunday/g) ?? []).length;
            }
            default:
                return 0;
        }

    }
}