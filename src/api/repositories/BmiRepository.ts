import { EntityRepository, Repository } from "typeorm";
import { BmiModel } from "../models/BmiModel";
import { getMongoRepository } from 'typeorm';


@EntityRepository(BmiModel)
export class BmiRepository extends Repository<BmiModel> {
    private bmiRepo = getMongoRepository(BmiModel);

    public async isExistBmiOfDay(userId): Promise<BmiModel | null> {
        // const qb = await this.createQueryBuilder('bmi')
        //     .andWhere('bmi.user_id =:userId', { userId: userId });
        // qb.orderBy('bmi.created_at', 'DESC')
        // return qb.getOne()
        const pipeline: any[] = [
            {
                $sort: {
                    createdAt: -1
                }
            },
        ];
        pipeline.push({
            $match: {
                userId: userId
            }
        })
        const bmi = await this.bmiRepo.aggregate(pipeline).toArray();
        return bmi[0]
    }

    public async bmiInfoById(userId: string): Promise<BmiModel> {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const pipeline = [
            {
                $match: {
                    userId: userId,
                    createdAt: {
                        $gte: new Date(today.toISOString()), 
                        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                    }
                }
            },
        ];

        const bmi = await this.bmiRepo.aggregateEntity(pipeline).toArray();
        return bmi?.length > 0 ? bmi[0] : null;
        // const qb = await this.createQueryBuilder('bmi')
        //     .andWhere('bmi.user_id=:userId', { userId: userId })
        //     .andWhere(`DATE_FORMAT(bmi.created_at, '%y-%m-%d') = DATE_FORMAT(:date,'%y-%m-%d')`, { date: new Date() })
        // return qb.getOne();
    
    }
}