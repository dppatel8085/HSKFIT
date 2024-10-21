
import { EntityRepository, Repository } from "typeorm";
import { WaterTrackerModel } from "../models/WaterTrackerModel";
import { getMongoRepository } from 'typeorm';


@EntityRepository(WaterTrackerModel)
export class WaterTrackerRepository extends Repository<WaterTrackerModel> {
    private waterRepo = getMongoRepository(WaterTrackerModel);

    public async lastDataAddWater(userId: string): Promise<WaterTrackerModel> {
        // const waterTracRepository = getMongoRepository(WaterTrackerModel);

        // const qb = await this.createQueryBuilder('water_tracker')
        //     .andWhere('water_tracker.user_id =:userId', { userId: userId });

        // qb.orderBy('water_tracker.created_at', 'DESC')
        // return qb.getOne();

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
        const water = await this.waterRepo.aggregate(pipeline).toArray();
        return water[0]

    }

    public async waterInfoById(userId: string): Promise<WaterTrackerModel> {
        console.log(userId,'000000')

        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    
        const query = {
            userId: userId,
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        };
    
        const waterTracker = await this.waterRepo.findOne({ where: query });
        return waterTracker;
        
        // const result = await this.waterRepo.aggregate(pipeline).toArray();
        // return result[0] || null;
        // const qb = this.createQueryBuilder('water_tracker')
        //     .andWhere('water_tracker.user_id =:userId', { userId: userId })
        //     .andWhere(`DATE_FORMAT(water_tracker.created_at,'%y-%m-%d') = DATE_FORMAT(:date,'%y-%m-%d')`, { date: new Date() })
        // return qb.getOne()
    }

   
    
}