import { Logger, LoggerInterface } from "../../decorators/Logger";
import { Service } from "typedi";
import { OrmRepository } from "typeorm-typedi-extensions";
import { UserActivePlanRepository } from "../repositories/UserActivePlanRepository";
import { UserActivePlanModel } from "../models/UserActivePlanModel";
import { SubsCriptionPlansService } from "./SubsCriptionPlansService";

@Service()
export class UserActivePlanService {
    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @Service() private subsCriptionPlansService: SubsCriptionPlansService,
        @OrmRepository() private userActivePlanRepository: UserActivePlanRepository,
    ) {
    }

    /* ------------------ add user plan------------------ */
    public async assignPlanByUser(body: any): Promise<UserActivePlanModel> {
        this.log.info(`purchase subscription plan by user ${body}`)
        const isPlanExist = await this.userActivePlanRepository.isPlanExist(body?.userId);
        const subsCriptionPlanData = await this.subsCriptionPlansService.getSubscriptionPlanData(body?.planId);
        if (isPlanExist) {
            isPlanExist.expiredDate = new Date();
            isPlanExist.isExpire = true;
            await this.userActivePlanRepository.save(isPlanExist);
        }
        const calculateExpireDate = await this.userActivePlanRepository.calculateExpireDate(body?.activationDate, subsCriptionPlanData['durationInMonth'])
        body.expiredDate = calculateExpireDate;
        return await this.userActivePlanRepository.save(body)
    }


    public async userActivePlanExpire():Promise<UserActivePlanModel | void>{
         await this.userActivePlanRepository.userActivePlanExpire()
    }


}