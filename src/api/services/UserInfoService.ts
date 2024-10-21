import { Logger, LoggerInterface } from "../../decorators/Logger";
import { Service } from "typedi";
import { OrmRepository } from "typeorm-typedi-extensions";
import { UserInfoRepository } from "../repositories/UserInfoRepository";
import { UserInfoModel } from "../models/UserInfoModel";
const ObjectId = require('mongodb').ObjectId;

@Service()
export class UserInfoService {
    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private userInfoRepository: UserInfoRepository,
    ) {
    }

    /*  ------------------ add user details -------------------  */
    public async adduserDetails(body: any): Promise<UserInfoModel | void> {
        this.log.info(`add user details`)
        const userInfo = await this.userInfoRepository.findOne({ userId: ObjectId(body?._id) })
        if (userInfo) {
            userInfo.dietaryPreference = JSON.stringify(body?.dietaryPreference);
            userInfo.weight = body?.weight;
            userInfo.isKg = body?.isKg
            userInfo.healthProblem = body?.healthProblem
            userInfo.weightLose = JSON.stringify(body?.weightLose);
            userInfo.healthCondition = JSON.stringify(body?.healthCondition);
            userInfo.previousWeightLose = JSON.stringify(body?.previousWeightLose);
            userInfo.ledToYourWeightGain = JSON.stringify(body?.ledToYourWeightGain);
            userInfo.avgDayBusy = body?.avgDayBusy;
            userInfo.okayWithPaidPlan = body?.okayWithPaidPlan;
            userInfo.healthAssesementScore = body?.healthAssesementScore;
            return await this.userInfoRepository.save(userInfo);
        }
        if (body?.height) {
            return await this.userInfoRepository.save({ userId: ObjectId(body?._id), height: body?.height, isFeet: body?.isFeet ? body?.isFeet : true });
        }

    }

    /* ---------------------  get user data by user id ----------------- */
    public async userData(userId: string): Promise<UserInfoModel> {
        const res = await this.userInfoRepository.findOne({ userId: userId });
        if (res) {
            res._id = res?._id?.toString();
            res.userId = res?.userId?.toString();
            return res;
        }
        return null;
    }

    /* ---------------------  get user data by user id ----------------- */
    public async userUpdate(userId: string, height: string, weight: string, isFeet: any, isKg: any): Promise<UserInfoModel | void> {
        const res = await this.userInfoRepository.findOne({ userId: userId })
        if (res) {
            res.height = height;
            res.weight = weight;
            if (isFeet)
                res.isFeet = (isFeet == 'true') ? true : false;
            if (isKg)
                res.isKg = (isKg == 'true') ? true : false;
            await this.userInfoRepository.save(res);
            return await this.userInfoRepository.findOne({ userId: userId })
        }
        if (height || weight)
            return await this.userInfoRepository.save({ userId: userId, height: height ? height : null, weight: weight ? weight : null, isFeet: (isFeet == 'false') ? false : true, isKg: (isKg == 'false') ? false : true })
    }


}