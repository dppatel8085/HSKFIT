import { EntityRepository, Repository } from "typeorm";
import { WeightTrackerModel } from "../models/WeightTrackerModel";
import { Filter } from "../controllers/requests/User";
import { getMongoRepository } from 'typeorm';


@EntityRepository(WeightTrackerModel)
export class WeightTrackerRepository extends Repository<WeightTrackerModel> {
    private weightRepo = getMongoRepository(WeightTrackerModel);

    public async lastEntryWeightTracker(userId: string): Promise<WeightTrackerModel> {
        // const qb = await this.createQueryBuilder('weight_tracker')
        //     .andWhere('weight_tracker.user_id =:userId', { userId: userId })
        //     .orderBy('weight_tracker.created_at', 'DESC')
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
        const weight = await this.weightRepo.aggregate(pipeline).toArray();
        console.log(weight,'weight')
        return weight[0]
    }

    public async getWeight(param: Filter, userId: string): Promise<WeightTrackerModel | any> {
        const latestYearPipeline = [
            {
                $match: {
                    userId: userId
                }
            },
            {
                $group: {
                    _id: null,
                    latestYear: { $max: { $year: "$createdAt" } }
                }
            },
            {
                $project: {
                    _id: 0,
                    latestYear: 1
                }
            }
        ];

        const latestYearResult = await this.weightRepo.aggregate(latestYearPipeline).toArray();
        console.log(userId,'latestYearResult',latestYearResult);
        const latestYear = latestYearResult[0]?.latestYear;
        let pipeline = [];

        
        if (param?.Quarterly) {
            
             pipeline = [
                {
                    $match: {
                        userId: userId,
                        createdAt: {
                            $gte: new Date(`${latestYear}-01-01T00:00:00.000Z`),
                            $lte: new Date(`${latestYear}-12-31T23:59:59.999Z`)
                        }
                    }
                },
                {
                    $addFields: {
                        quarter: {
                            $switch: {
                                branches: [
                                    { case: { $lte: [{ $month: "$createdAt" }, 3] }, then: "JAN-MAR" },
                                    { case: { $lte: [{ $month: "$createdAt" }, 6] }, then: "APR-JUN" },
                                    { case: { $lte: [{ $month: "$createdAt" }, 9] }, then: "JUL-SEP" },
                                    { case: { $lte: [{ $month: "$createdAt" }, 12] }, then: "OCT-DEC" }
                                ],
                                default: "UNKNOWN"
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: "$quarter",
                        weight: { $avg: "$weightInKg" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        quarter: "$_id",
                        weight: 1
                    }
                }
            ];



            // pipeline = [
            //     {
            //         $match: {
            //             userId: userId,
            //             createdAt: {
            //                 $gte: new Date(`${latestYear}-01-01T00:00:00.000Z`),
            //                 $lte: new Date(`${latestYear}-12-31T23:59:59.999Z`)
            //             }
            //         }
            //     },
            //     {
            //         $group: {
            //             _id: { $quarter: "$createdAt" },
            //             weight: { $avg: "$weightInKg" }
            //         }
            //     },
            //     {
            //         $project: {
            //             _id: 0,
            //             quarter: {
            //                 $switch: {
            //                     branches: [
            //                         { case: { $eq: ["$_id", 1] }, then: "JAN-MAR" },
            //                         { case: { $eq: ["$_id", 2] }, then: "APR-JUN" },
            //                         { case: { $eq: ["$_id", 3] }, then: "JUL-SEP" },
            //                         { case: { $eq: ["$_id", 4] }, then: "OCT-DEC" }
            //                     ],
            //                     default: "UNKNOWN"
            //                 }
            //             },
            //             weight: 1
            //         }
            //     }
            // ];
        } else if (param?.Yearly) {
            pipeline = [
                {
                    $match: {
                        userId: userId
                    }
                },
                {
                    $group: {
                        _id: { $year: "$createdAt" },
                        weight: { $avg: "$weightInKg" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        year: "$_id",
                        weight: 1
                    }
                }
            ];
        } else {
            pipeline = [
                {
                  $match: {
                    userId: userId,
                    createdAt: {
                      $gte: new Date(`${latestYear}-01-01T00:00:00.000Z`),
                      $lte: new Date(`${latestYear}-12-31T23:59:59.999Z`)
                    }
                  }
                },
                {
                    $addFields: {
                        weightInKg: { $toDouble: "$weightInKg" }
                    }
                },
                {
                  $group: {
                    _id: { $month: "$createdAt" },
                    weight: { $avg: "$weightInKg" }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    month: "$_id",
                    monthName: {
                      $switch: {
                        branches: [
                          { case: { $eq: ["$_id", 1] }, then: "JAN" },
                          { case: { $eq: ["$_id", 2] }, then: "FEB" },
                          { case: { $eq: ["$_id", 3] }, then: "MAR" },
                          { case: { $eq: ["$_id", 4] }, then: "APR" },
                          { case: { $eq: ["$_id", 5] }, then: "MAY" },
                          { case: { $eq: ["$_id", 6] }, then: "JUN" },
                          { case: { $eq: ["$_id", 7] }, then: "JUL" },
                          { case: { $eq: ["$_id", 8] }, then: "AUG" },
                          { case: { $eq: ["$_id", 9] }, then: "SEP" },
                          { case: { $eq: ["$_id", 10] }, then: "OCT" },
                          { case: { $eq: ["$_id", 11] }, then: "NOV" },
                          { case: { $eq: ["$_id", 12] }, then: "DEC" }
                        ],
                        default: "UNKNOWN"
                      }
                    },
                    weight: 1
                  }
                }
              ];
              
        }
        const result = await this.weightRepo.aggregate(pipeline).toArray();
        console.log('result',result);
        return result;

        // const qb = await this.createQueryBuilder('weight_tracker');
        // const latestYearResult = await qb
        //     .select('YEAR(MAX(weight_tracker.created_at))', 'latestYear')
        //     .getRawOne();
        // const latestYear = latestYearResult.latestYear;

        // let result;
        // if (param?.Quarterly) {
        //     result = await qb
        //         .select([
        //             ` CASE 
        //             WHEN QUARTER(weight_tracker.created_at) =1 THEN 'JAN-MAR'
        //             WHEN QUARTER(weight_tracker.created_at) =2 THEN 'APR-JUN'
        //             WHEN QUARTER(weight_tracker.created_at) =3 THEN 'JUL-SEP'
        //             WHEN QUARTER(weight_tracker.created_at) =4 THEN 'OCT-DEC'
        //             END as quarter`,
        //             '(SUM(weight_tracker.weight_in_kg)/COUNT(weight_tracker.weight_in_kg)) as weight'
        //         ])
        //         .andWhere('weight_tracker.user_id = :userId', { userId: userId })
        //         .andWhere('YEAR(weight_tracker.created_at) = :latestYear', { latestYear })
        //         .groupBy('QUARTER(weight_tracker.created_at)')
        //         .getRawMany();
        // } else if (param?.Yearly) {
        //     result = await qb
        //         .select([
        //             'YEAR(weight_tracker.created_at) AS  year',
        //             '(SUM(weight_tracker.weight_in_kg)/COUNT(weight_tracker.weight_in_kg))  as weight'
        //         ])
        //         .andWhere('weight_tracker.user_id = :userId', { userId: userId })
        //         .groupBy('YEAR(weight_tracker.created_at)')
        //         .getRawMany();
        // } else {
        //     result = await qb
        //         .select([
        //             'MONTH(weight_tracker.created_at) AS month',
        //             'weight_tracker.created_at',
        //             `CASE 
        //            WHEN MONTH(weight_tracker.created_at) = 1 THEN 'JAN'
        //            WHEN MONTH(weight_tracker.created_at) = 2 THEN 'FEB'
        //            WHEN MONTH(weight_tracker.created_at) = 3 THEN 'MAR'
        //            WHEN MONTH(weight_tracker.created_at) = 4 THEN 'APR'
        //            WHEN MONTH(weight_tracker.created_at) = 5 THEN 'MAY'
        //            WHEN MONTH(weight_tracker.created_at) = 6 THEN 'JUN'
        //            WHEN MONTH(weight_tracker.created_at) = 7 THEN 'JUL'
        //            WHEN MONTH(weight_tracker.created_at) = 8 THEN 'AUG'
        //            WHEN MONTH(weight_tracker.created_at) = 9 THEN 'SEP'
        //            WHEN MONTH(weight_tracker.created_at) = 10 THEN 'OCT'
        //            WHEN MONTH(weight_tracker.created_at) = 11 THEN 'NOV'
        //            WHEN MONTH(weight_tracker.created_at) = 12 THEN 'DEC'
        //            END as monthName` ,
        //             '(weight_tracker.weight_in_kg) /COUNT(weight_tracker.weight_in_kg) AS weight'
        //         ])
        //         .andWhere('weight_tracker.user_id = :userId', { userId: userId })
        //         .groupBy('MONTH(weight_tracker.created_at) ')
        //         .andWhere('YEAR(weight_tracker.created_at) = :latestYear', { latestYear })
        //         .getRawMany();
        // }
        // return result;
    }


}
