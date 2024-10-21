import { EntityRepository, Repository } from "typeorm";
import { MealPictureModel } from "../models/MealPictureModel";
import { Filter } from "../controllers/requests/User";
import { getMongoRepository } from 'typeorm';


@EntityRepository(MealPictureModel)
export class MealPictureRepository extends Repository<MealPictureModel> {
    private MealPictreRepo = getMongoRepository(MealPictureModel);

    public async mealDataUser(userId: number, filter: Filter): Promise<MealPictureModel[]> {



        const pipeline = [
            {
                $match: {
                    userId: userId
                }
            },
            {
                $addFields: {
                    createdAt: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                }
            },
            ...(filter.startDate && filter.endDate ? [
                {
                    $match: {
                        createdAt: {
                            $gte: filter.startDate,
                            $lte: filter.endDate
                        }
                    }
                }
            ] : filter.startDate ? [
                {
                    $match: {
                        createdAt: {
                            $gte: filter.startDate
                        }
                    }
                }
            ] : []),
            {
                $sort: {
                    createdAt: -1
                }
            }
        ];

        const result = await this.MealPictreRepo.aggregate(pipeline).toArray();
        console.log(result);
        return result;

        // let result = response?.map((ele) => ({ ...ele, _id: ele._id.toString() }));
        // const qb = await this.createQueryBuilder('meal_picture')
        //     .andWhere(`meal_picture.user_id =:userId`, { userId: userId })

        // if (filter.startDate && filter.endDate) {
        //     qb.andWhere(`DATE_FORMAT(meal_picture.created_at,'%y-%m-%d') >= DATE_FORMAT(:startDate,'%y-%m-%d') 
        // AND DATE_FORMAT(meal_picture.created_at,'%y-%m-%d') <= DATE_FORMAT(:endDate,'%y-%m-%d')`,
        //         { startDate: filter.startDate, endDate: filter.endDate }
        //     )
        // } else if (filter.startDate) {
        //     qb.andWhere(`DATE_FORMAT(meal_picture.created_at,'%y-%m-%d') >= DATE_FORMAT(:startDate,'%y-%m-%d')`,
        //         { startDate: filter.startDate }
        //     )
        // }

        // qb.orderBy('meal_picture.created_at', 'DESC')
        // return qb.getMany()
    }

}