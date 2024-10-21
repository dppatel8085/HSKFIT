import { EntityRepository, Repository } from "typeorm";
import { UserActivePlanModel } from "../models/UserActivePlanModel";
import moment from 'moment';
import { getMongoRepository } from 'typeorm'


@EntityRepository(UserActivePlanModel)
export class UserActivePlanRepository extends Repository<UserActivePlanModel> {
    private userActivePlanRepo = getMongoRepository(UserActivePlanModel);

    public async isPlanExist(userId: string): Promise<UserActivePlanModel> {

        const result = await this.userActivePlanRepo.findOne({
            where: {
                userId: userId,
                isExpire: false
            },
            order: {
                createdAt: 'DESC'
            }
        });

        return result;
        // const qb = await this.createQueryBuilder('user_active_plan')
        //     .andWhere('user_active_plan.user_id =:userId', { userId: userId })
        //     .andWhere('user_active_plan.is_expire =:isExpire', { isExpire: false })
        // qb.orderBy('user_active_plan.created_at', 'DESC');
        // return qb.getOne();
    }

    public async calculateExpireDate(activationDate: Date, durationInMonth: any): Promise<UserActivePlanModel | any> {
        var currentDate = moment(activationDate);
        var futureMonth = moment(currentDate).add(durationInMonth, 'M');
        var futureMonthEnd = moment(futureMonth).endOf('month');

        if (currentDate.date() != futureMonth.date() && futureMonth.isSame(futureMonthEnd.format('YYYY-MM-DD'))) {
            futureMonth = futureMonth.add(1, 'd');
        }
        const expireDate = moment(futureMonth).format('YYYY-MM-DD');
        return expireDate

    }

    public async isExpire(userId: string): Promise<UserActivePlanModel> {
        // const qb = await this.createQueryBuilder('user_active_plan')
        //     .andWhere('user_active_plan.user_id =:userId', { userId: userId })
        //     .andWhere('user_active_plan.is_expire =:isExpire', { isExpire: false })
        // return qb.getOne();
        const qb = await this.findOne({ userId: userId, isExpire: false })
        return qb;
    }

    public async userActivePlanExpire(): Promise<UserActivePlanModel | void> {
        const dateFrom = new Date();
        const formattedDateFrom = dateFrom.toISOString().split('T')[0];

        await this.userActivePlanRepo.updateMany(
            {
                $expr: {
                    $eq: [
                        { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$expiredDate" } } },
                        formattedDateFrom
                    ]
                }
            },
            {
                $set: {
                    expiredDate: new Date(),
                    isExpire: true
                }
            }
        );


        // await this.createQueryBuilder('user_active_plan')
        //     .update('user_active_plan')
        //     .set({ expiredDate: new Date(), isExpire: true })
        //     .where('DATE(user_active_plan.expired_date) = DATE(:dateFrom)', { dateFrom: new Date() })
        //     .execute();
    }


}