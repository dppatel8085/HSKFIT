import { EntityRepository, Repository } from "typeorm";
import { SubsCriptionPlansModel } from "../models/SubscriptionPlansModel";
import { Filter } from "../controllers/requests/User";
import { Role } from "../enums/Users";
import { getMongoRepository } from 'typeorm';

@EntityRepository(SubsCriptionPlansModel)
export class SubsCriptionPlanRepository extends Repository<SubsCriptionPlansModel> {

    public async subsCriptionPlanList(filter: Filter, roleId: number): Promise<any[]> {
        const subscriptionPlanRepository = getMongoRepository(SubsCriptionPlansModel);

        const query: any = {};

        if (roleId !== Role.ADMIN) {
            query.status = true;
        }

        if (filter['active'] === 'true') {
            query.status = true;
        }

        let sort: any = { updatedAt: -1 };
        if (filter.sortField && filter.sortValue) {
            sort = { [filter.sortField]: filter.sortValue.toLowerCase() === 'asc' ? 1 : -1 };
        }

        const plans = await subscriptionPlanRepository.find({
            where: query,
            order: sort,
        });

        const parsedPlans = plans?.map(plan => ({
            _id: plan?._id?.toString(),
            planName: plan?.planName,
            planIncludes: plan?.planIncludes ? JSON.parse(plan?.planIncludes) : '',
            durationInMonth: plan?.durationInMonth,
            status: plan?.status,
        }));
        return parsedPlans;


        // const qb = await this.createQueryBuilder('subscription_plans')
        //     .select(['subscription_plans.id', 'subscription_plans.planName', 'subscription_plans.planIncludes', 'subscription_plans.durationInMonth', 'subscription_plans.status'])
        // if (roleId != Role.ADMIN)
        //     qb.andWhere('subscription_plans.status=:status', { status: true })

        // if (filter['active'] == 'true') {
        //     qb.andWhere('subscription_plans.status=:status', { status: true })
        // }

        // if (filter.sortField && filter.sortValue) {
        //     qb.orderBy(`subscription_plans.${filter.sortField}`, filter.sortValue);
        // } else {
        //     qb.orderBy('subscription_plans.updated_at', 'DESC');
        // }

        // const plans = await qb.getMany();
        // const parsedPlans = plans.map(plan => {
        //     return {
        //         id: plan._id,
        //         planName: plan.planName,
        //         planIncludes: JSON.parse(plan.planIncludes),
        //         durationInMonth: plan.durationInMonth,
        //         status: plan.status
        //     };
        // });
        // return parsedPlans;
    }

    public async totalsubscriptionPlan(userId: string, roleId: number): Promise<SubsCriptionPlansModel | any> {
        if (roleId == Role.DIETITIAN) return 0;
        const subscriptionPlanRepository = getMongoRepository(SubsCriptionPlansModel);
        const pipeline = [
            { $count: "totalSubscriptionPlan" }
        ]
        const totalSubscriptionPlan = await subscriptionPlanRepository.aggregate(pipeline).toArray();
        return totalSubscriptionPlan?.length ? totalSubscriptionPlan[0]?.totalSubscriptionPlan : 0;
    }

}