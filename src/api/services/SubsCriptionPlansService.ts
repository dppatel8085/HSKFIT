import { Logger, LoggerInterface } from "../../decorators/Logger";
import { Service } from "typedi";
import { OrmRepository } from "typeorm-typedi-extensions";
import { SubsCriptionPlanRepository } from "../repositories/SubsCriptionPlansRepository";
import { SubsCriptionPlansModel } from "../models/SubscriptionPlansModel";
import { SubsCriptionError, SubsCriptionPlanNotFound } from "../errors/SubsCriptionPlan";
import { Filter } from "../controllers/requests/User";
import { SubsCriptionRes } from "../controllers/respons/SubsCriptionPlan";
import { SubsCriptionReq } from "../controllers/requests/SubsCriptionPlan";
import { ObjectId } from 'mongodb'

@Service()
export class SubsCriptionPlansService {
    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private subsCriptionPlanRepository: SubsCriptionPlanRepository,
    ) {
    }

    public async subsCriptionPlanList(params: Filter, roleId: number): Promise<SubsCriptionPlansModel[]> {
        this.log.info(`subscriptiion plan for admin and user `)
        return await this.subsCriptionPlanRepository.subsCriptionPlanList(params, roleId);
    }

    /* ------------------ add subscription plan ------------------ */
    public async addSubscriptionPlan(body: SubsCriptionReq): Promise<SubsCriptionPlansModel> {
        this.log.info(`add subscription plan by admin ${body}`)
        const isPlanNameExist = await this.subsCriptionPlanRepository.findOne({ planName: body?.planName });
        if (isPlanNameExist)
            throw new SubsCriptionError()
        body.planIncludes = JSON.stringify(body?.planIncludes)
        body.status=false;
        return await this.subsCriptionPlanRepository.save(body);
    }

    /*  ------------------update plan by admin ---------------  */
    public async updatePlan(updateBody: SubsCriptionRes): Promise<SubsCriptionPlansModel | {}> {
        this.log.info(`Update plan by admin ${updateBody}`);
        const id = new ObjectId(updateBody?._id);
        updateBody.id = id;
        const isSubsCriptionPlanDataExist = await this.subsCriptionPlanRepository.findOne({ _id: updateBody?.id });
        if (isSubsCriptionPlanDataExist) {
            isSubsCriptionPlanDataExist.planName = updateBody?.planName;
            isSubsCriptionPlanDataExist.durationInMonth = updateBody?.durationInMonth;
            isSubsCriptionPlanDataExist.planIncludes = JSON.stringify(updateBody?.planIncludes);
            isSubsCriptionPlanDataExist.status = updateBody?.status;
            await this.subsCriptionPlanRepository.save(isSubsCriptionPlanDataExist);
            return await this.subsCriptionPlanRepository.findOne(updateBody?.id);
        }
        throw new SubsCriptionPlanNotFound();
    }

    /*  ------------------delete plan by admin ---------------  */
    public async deletePlan(id: string, res: any): Promise<SubsCriptionPlansModel> {
        this.log.info('delete plan by id')
        const _id = new ObjectId(id);
        const subscriptionDataExist = await this.subsCriptionPlanRepository.findOne(_id);
        if (!subscriptionDataExist)
            throw new SubsCriptionPlanNotFound();
        await this.subsCriptionPlanRepository.delete(_id);
        return res.status(200).send({ success: true, MESSAGE: 'SUCCESSFULLY_DELETE' })
    }

    public async getSubscriptionPlanData(id: string): Promise<SubsCriptionPlansModel | boolean> {
        this.log.info('get getSubscriptionPlanData by id')
        const subscriptionDataExist = await this.subsCriptionPlanRepository.findOne({ _id: id });
        if (subscriptionDataExist)
            return subscriptionDataExist;
        throw new SubsCriptionPlanNotFound();
    }

    /*  ------------------------ total subscription plan -------------- */
    public async totalsubscriptionPlan(userId:string,roleId:number):Promise<SubsCriptionPlansModel>{
        this.log.info(`get total subscription plan`)
        return await this.subsCriptionPlanRepository.totalsubscriptionPlan(userId,roleId)
    }


}