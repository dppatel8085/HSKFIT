import { EntityRepository, Repository } from "typeorm";
import { MeasurmentTrackerModel } from "../models/MeasurmentTrackerModel";
import { Filter } from "../controllers/requests/User";
import { getMongoRepository } from 'typeorm';


@EntityRepository(MeasurmentTrackerModel)
export class MeasurmentTrackerRepository extends Repository<MeasurmentTrackerModel> {
    private MeasurmentTrackerRepo = getMongoRepository(MeasurmentTrackerModel)

    public async lastMeasurmentTrackerData(userId: string): Promise<MeasurmentTrackerModel> {
        // const qb = await this.createQueryBuilder('measurment_tracker')
        //     .andWhere('measurment_tracker.user_id =:userId', { userId: userId })
        //     .orderBy('measurment_tracker.created_at', 'DESC')
        // return qb.getOne();
        const measurmentRepository = getMongoRepository(MeasurmentTrackerModel);
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
        const measurment = await measurmentRepository.aggregate(pipeline).toArray();
        return measurment[0];
    }

    public async getMeasurmentData(filter: Filter, userId: string): Promise<MeasurmentTrackerModel[] | any> {

        const pipeline: any[] = [
            {
                $match: {
                    userId: userId
                }
            },
            {
                $addFields: {
                    formattedDate: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    _id: { $toString: '$_id' },   // to convert id to string
                    userId: { $toString: '$userId' }
                }
            }

        ];

        if (filter?.startDate && filter?.endDate) {
            pipeline.push({
                $match: {
                    formattedDate: {
                        $gte: filter.startDate,
                        $lte: filter.endDate
                    }
                }
            } as any);
        } else if (filter?.startDate) {
            pipeline.push({
                $match: {
                    formattedDate: filter.startDate
                }
            } as any);
        } else {
            pipeline.push({
                $sort: {
                    createdAt: -1
                }
            } as any);

            pipeline.push({
                $limit: 1
            } as any);
        }

        pipeline.push({
            $project: {
                formattedDate: 0
            }
        } as any);
        const result = await this.MeasurmentTrackerRepo.aggregate(pipeline).toArray();

        return result;


        // const qb = await this.createQueryBuilder('measurment_tracker')
        //     .andWhere('measurment_tracker.user_id =:userId', { userId: userId })


        // if (filter?.startDate && filter?.endDate) {
        //     qb.andWhere(`DATE_FORMAT(measurment_tracker.created_at, '%y-%m-%d') >= DATE_FORMAT(:dateFrom, '%y-%m-%d')
        //     AND DATE_FORMAT(measurment_tracker.created_at, '%y-%m-%d') <= DATE_FORMAT(:dateTo, '%y-%m-%d')
        // `, { dateFrom: filter.startDate, dateTo: filter.endDate });
        // } else if (filter?.startDate) {
        //     qb.andWhere(`DATE_FORMAT(measurment_tracker.created_at,'%y-%m-%d') = DATE_FORMAT(:startDate,'%y-%m-%d')`, { startDate: filter.startDate })
        // } else {
        //     qb.orderBy('measurment_tracker.created_at', 'DESC')
        //     let res = await qb.getOne();
        //     return [res];
        // }
        // return qb.getMany();
    }

}