import { EntityRepository, Repository } from "typeorm";
import { RecipeModel } from "../models/RecipeModel";
import { Role } from "../enums/Users";
import { Pagination } from "nestjs-typeorm-paginate";
import { Filter } from "../controllers/requests/User";
import { getMongoRepository } from 'typeorm';


@EntityRepository(RecipeModel)
export class RecipeRepository extends Repository<RecipeModel> {
    private recipeRepo = getMongoRepository(RecipeModel)

    public async getRecipeList(filter: any, roleId: number, userId: string): Promise<RecipeModel[] | any> {

        const pipeline = [];

        if (Role.ADMIN != roleId) {
            pipeline.push({
                $match: { isActive: true }
            });
        }

        if (filter.q) {
            const regex = new RegExp(filter.q, 'i');
            pipeline.push({
                $match: {
                    recipeTitle: { $regex: regex }
                }
            });
        }

        if (filter.isActive === 'true') {
            pipeline.push({
                $match: { isActive: true }
            });
        } else if (filter.isActive === 'false') {
            pipeline.push({
                $match: { isActive: false }
            });
        }

        if (filter.startDuration && filter.endDuration) {
            pipeline.push({
                $match: {
                    makingDuration: { $gte: filter.startDuration, $lte: filter.endDuration }
                }
            });
        }

        pipeline.push({
            $lookup: {
                from: 'recipe_like',
                let: { recipeId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$recipeId', '$$recipeId'] },
                                    { $eq: ['$isRecipe', true] },
                                    { $eq: ['$userId', userId] }
                                ]
                            }
                        }
                    },
                    {
                        $project: { isLike: 1 }
                    }
                ],
                as: 'recipeLike'
            }
        });

        // pipeline.push({
        //     $addFields: {
        //         likeCount: {
        //             $size: {
        //                 $filter: {
        //                     input: '$recipeLike',
        //                     as: 'like',
        //                     cond: { $eq: ['$$like.isRecipe', true] }
        //                 }
        //             }
        //         },
        //         recipeLike: {
        //             $ifNull: [{ $arrayElemAt: ['$recipeLike', 0] }, { isLike: null }]
        //         }
        //     }
        // });

  
       pipeline.push( {
            $lookup: {
                from: 'recipe_like',
                let: { recipeId: '$_id' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$recipeId', '$$recipeId'] }, isRecipe: true } },
                    { $project: { _id: 1 } }
                ],
                as: 'recipeLikeCount'
            }
        }),
      pipeline.push(  { $unwind: { path: '$recipeLike', preserveNullAndEmptyArrays: true } })

        pipeline.push({
            $project: {
                _id: 1,
                recipeTitle: 1,
                makingDuration: 1,
                indredient: 1,
                cookingDirection: 1,
                recipeImage: 1,
                isActive: 1,
                'recipeLike.isLike': 1,

                // 'recipeLike.isLike': 1,
                'recipeLikeCount._id':1,
                // likeCount: 1
            }
        });

        if (filter.sortField && filter.sortValue) {
            const sortDirection = filter.sortValue === 'ASC' ? 1 : -1;
            pipeline.push({
                $sort: { [filter.sortField]: sortDirection }
            });
        } else {
            pipeline.push({
                $sort: { updatedAt: -1 }
            });
        }

        return await this.recipeRepo.aggregate(pipeline).toArray();



        //     const qb = await this.createQueryBuilder('recipe')
        //         .select([
        //             'recipe.id', 'recipe.recipeTitle', 'recipe.makingDuration', 'recipe.indredient', 'recipe.cookingDirection', 'recipe.recipeImage', 'recipe.isActive',
        //             'recipeLike.isLike',
        //             `(SELECT COUNT(*) FROM recipe_like WHERE recipe_like.recipe_id = recipe.id AND recipe_like.is_recipe = true) AS likeCount`
        //         ])
        //         .leftJoin('recipe.recipeLike', 'recipeLike', `recipeLike.is_recipe =:isRecipe AND recipeLike.user_id =:userId`, { isRecipe: true, userId: userId })

        //     if (Role.ADMIN != roleId)
        //         qb.andWhere('recipe.is_active =:isActive', { isActive: true })

        //     if (filter.q) {
        //         qb.andWhere(`(
        //     recipe.recipeTitle LIKE :q 
        //     )`, { q: `${filter.q}%` })
        //     }

        //     if (filter.isActive === 'true') {
        //         qb.andWhere('recipe.is_active = :active', { active: true });
        //     }
        //     else if (filter.isActive === 'false') {
        //         qb.andWhere('recipe.is_active = :isActive', { isActive: false });
        //     }

        //     if (filter.startDuration && filter.endDuration) {
        //         qb.andWhere(`recipe.making_duration >= :startDuration
        //     AND recipe.making_duration <= :endDuration
        // `, { startDuration: filter.startDuration, endDuration: filter.endDuration });
        //     }

        //     if (filter.sortField && filter.sortValue) {
        //         qb.orderBy(`recipe.${filter.sortField}`, filter.sortValue);
        //     } else {
        //         qb.orderBy('recipe.updated_at', 'DESC');
        //     }

        //     return await qb.getRawMany();
    }


    public async getRecipeListByAdmin(filter: Filter, roleId: number): Promise<Pagination<RecipeModel[]>> {
        const recipeRepository = getMongoRepository(RecipeModel);
        const pipeline: any[] = [
            {
                $lookup: {
                    from: 'recipe_like',
                    localField: '_id',
                    foreignField: 'recipeId',
                    as: 'recipeLike'
                }
            },
            {
                $addFields: {
                    recipeLike: {
                        $filter: {
                            input: '$recipeLike',
                            as: 'recipeLike',
                            cond: { $eq: ['$$recipeLike.isRecipe', true] }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    recipeTitle: 1,
                    makingDuration: 1,
                    indredient: 1,
                    cookingDirection: 1,
                    recipeImage: 1,
                    isActive: 1,
                    'recipeLike.isLike': 1
                }
            }
        ];

        if (filter.isActive === 'true') {
            pipeline.push({
                $match: {
                    isActive: true
                }
            });
        } else if (filter.isActive === 'false') {
            pipeline.push({
                $match: {
                    isActive: false
                }
            });
        }

        if (filter.q) {
            pipeline.push({
                $match: {
                    recipeTitle: { $regex: new RegExp(filter.q, 'i') }
                }
            });
        }

        if (filter.startDuration && filter.endDuration) {
            pipeline.push({
                $match: {
                    makingDuration: { $gte: filter.startDuration, $lte: filter.endDuration }
                }
            });
        }

        if (filter.sortField && filter.sortValue) {
            pipeline.push({
                $sort: {
                    [filter.sortField]: filter.sortValue === 'ASC' ? 1 : -1
                }
            });
        } else {
            pipeline.push({
                $sort: {
                    updatedAt: -1
                }
            });
        }
        const recipes = await recipeRepository.aggregate(pipeline).toArray();
        // let recipes = response?.map((ele) => ({ ...ele, _id: ele._id.toString() }));

        const page = Number(filter?.page ?? 1);
        const limit = Number(filter?.limit ?? 10);
        const totalItems = recipes?.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedItems = recipes?.slice(startIndex, endIndex);
        const metaData = {
            totalItems: totalItems,
            itemCount: paginatedItems?.length,
            itemsPerPage: limit,
            totalPages: totalPages,
            currentPage: page
        };
        return {
            items: paginatedItems,
            meta: metaData
        };



        // .select([
        //     'recipe.id', 'recipe.recipeTitle', 'recipe.makingDuration', 'recipe.indredient', 'recipe.cookingDirection', 'recipe.recipeImage', 'recipe.isActive'
        //     , 'recipeLike.id',
        // ])
        // .leftJoinAndSelect('recipe.recipeLike', 'recipeLike', `recipeLike.isRecipe =:isRecipe`, { isRecipe: true })
        // let qb: any = await this.createQueryBuilder('recipe')
        // .select([
        //     'recipe.id', 'recipe.recipeTitle', 'recipe.makingDuration', 'recipe.indredient', 'recipe.cookingDirection', 'recipe.recipeImage', 'recipe.isActive'
        //     , 'recipeLike.id',
        // ])
        // .leftJoin('recipe.recipeLike', 'recipeLike', `recipeLike.is_recipe =:isRecipe`, { isRecipe: true })

        //     if (Role.ADMIN != roleId)
        //         qb.andWhere('recipe.is_active =:isActive', { isActive: true })

        //     if (filter.q) {
        //         qb.andWhere(`(
        //     recipe.recipeTitle LIKE :q 
        //     )`, { q: `${filter.q}%` })
        //     }

        //     if (filter.isActive === 'true') {
        //         qb.andWhere('recipe.is_active = :active', { active: true });
        //     }
        //     else if (filter.isActive === 'false') {
        //         qb.andWhere('recipe.is_active = :inActive', { inActive: false });
        //     }

        //     if (filter.startDuration && filter.endDuration) {
        //         qb.andWhere(`recipe.making_duration >= :startDuration
        //     AND recipe.making_duration <= :endDuration
        // `, { startDuration: filter.startDuration, endDuration: filter.endDuration });
        //     }

        //     if (filter.sortField && filter.sortValue) {
        //         qb.orderBy(`recipe.${filter.sortField}`, filter.sortValue);
        //     } else {
        //         qb.orderBy('recipe.updated_at', 'DESC');
        //     }

        // const page = !filter.page ? 1 : Number(filter.page);
        // const limit = !filter.limit ? 10 : Number(filter.limit);

        // return paginate(qb, { page, limit })
    }

    public async getRecipeListByUser(filter: Filter, roleId: number, userId: string): Promise<Pagination<RecipeModel[]> | any> {
        const recipeRepository = getMongoRepository(RecipeModel);

        let query: any = {};

        if (roleId !== Role.ADMIN) {
            query.isActive = true;
        }

        if (filter.q) {
            query.recipeTitle = { $regex: new RegExp(`^${filter.q}`, 'i') };
        }

        if (filter.isActive === 'true') {
            query.isActive = true;
        } else if (filter.isActive === 'false') {
            query.isActive = false;
        }

        if (filter.startDuration && filter.endDuration) {
            query.makingDuration = {
                $gte: filter.startDuration,
                $lte: filter.endDuration
            };
        }

        let sort: any = { updatedAt: -1 };
        if (filter.sortField && filter.sortValue) {
            sort = { [filter.sortField]: filter.sortValue.toLowerCase() === 'asc' ? 1 : -1 };
        }

        const pipeline: any[] = [
            { $match: query },
            {
                $lookup: {
                    from: 'recipe_like',
                    let: { recipeId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$recipeId', '$$recipeId'] }, isRecipe: true } },
                        { $project: { _id: 1, isLike: 1 } }
                    ],
                    as: 'recipeLike'
                }
            },
            {
                $lookup: {
                    from: 'recipe_like',
                    let: { recipeId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$recipeId', '$$recipeId'] }, { $eq: ['$userId', userId] }, { $eq: ['$isRecipe', true] }] } } },
                        { $project: { _id: 0, isLike: 1 } }
                    ],
                    as: 'isRecipeLike'
                }
            },
            // { $unwind: { path: '$recipeLike', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$isRecipeLike', preserveNullAndEmptyArrays: true } },
            { $sort: sort },
            {
                $project: {
                    _id: 1,
                    recipeTitle: 1,
                    makingDuration: 1,
                    indredient: 1,
                    cookingDirection: 1,
                    recipeImage: 1,
                    isActive: 1,
                    'isRecipeLike.isLike':1,
                    recipeLike: '$recipeLike.isLike',
                    // isLike: '$isRecipeLike.isLike'
                }
            }
        ];

        const result = await recipeRepository.aggregate(pipeline).toArray()
        // console.log(response,'=---55333--------')
        // let result = response?.map((ele) => ({ ...ele, _id: ele._id.toString() }));

        const page = Number(filter?.page ?? 1);
        const limit = Number(filter?.limit ?? 10);
        const totalItems = result?.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedItems = result?.slice(startIndex, endIndex);
        const metaData = {
            totalItems: totalItems,
            itemCount: paginatedItems?.length,
            itemsPerPage: limit,
            totalPages: totalPages,
            currentPage: page
        };
        return {
            items: paginatedItems,
            meta: metaData
        };




        //     let qb: any = await this.createQueryBuilder('recipe')
        //         .select([
        //             'recipe.id', 'recipe.recipeTitle', 'recipe.makingDuration', 'recipe.indredient', 'recipe.cookingDirection', 'recipe.recipeImage', 'recipe.isActive'
        //             , 'recipeLike.id',
        //             'isRecipeLike.isLike'
        //         ])
        //         .leftJoin('recipe.isRecipeLike', 'isRecipeLike', `isRecipeLike.user_id =:userId AND isRecipeLike.is_recipe =:isRecipe`, { userId: userId, isRecipe: true })
        //         .leftJoin('recipe.recipeLike', 'recipeLike', `recipeLike.is_recipe =:isRecipe`, { isRecipe: true })


        //     if (Role.ADMIN != roleId)
        //         qb.andWhere('recipe.is_active =:isActive', { isActive: true })

        //     if (filter.q) {
        //         qb.andWhere(`(
        //     recipe.recipeTitle LIKE :q 
        //     )`, { q: `${filter.q}%` })
        //     }

        //     if (filter.isActive === 'true') {
        //         qb.andWhere('recipe.is_active = :active', { active: true });
        //     }
        //     else if (filter.isActive === 'false') {
        //         qb.andWhere('recipe.is_active = :inActive', { inActive: false });
        //     }

        //     if (filter.startDuration && filter.endDuration) {
        //         qb.andWhere(`recipe.making_duration >= :startDuration
        //     AND recipe.making_duration <= :endDuration
        // `, { startDuration: filter.startDuration, endDuration: filter.endDuration });
        //     }

        //     const page = !filter.page ? 1 : Number(filter.page);
        //     const limit = !filter.limit ? 10 : Number(filter.limit);

        //     if (filter.sortField && filter.sortValue) {
        //         qb.orderBy(`recipe.${filter.sortField}`, filter.sortValue);
        //     } else {
        //         qb.orderBy('recipe.updated_at', 'DESC');
        //     }

        //     return paginate(qb, { page, limit })
    }

    public async getRecipeDataById(recipeId: string, userId: string): Promise<RecipeModel | any> {
        const recipeRepository = getMongoRepository(RecipeModel);

        const pipeline: any[] = [
            {
                $match: { _id: recipeId }
            },
            {
                $lookup: {
                    from: 'recipe_like',
                    let: { recipeId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$recipeId', '$$recipeId'] }, { $eq: ['$userId', userId] }, { $eq: ['$isRecipe', true] }] } } },
                        { $project: { _id: 0, isLike: 1 } }
                    ],
                    as: 'isRecipeLike'
                }
            },
            {
                $lookup: {
                    from: 'recipe_like',
                    let: { recipeId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$recipeId', '$$recipeId'] }, isRecipe: true } },
                        { $project: { _id: 1,isLike:1 } }
                    ],
                    as: 'recipeLike'
                }
            },
            { $unwind: { path: '$isRecipeLike', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    recipeTitle: 1,
                    makingDuration: 1,
                    indredient: 1,
                    cookingDirection: 1,
                    recipeImage: 1,
                    isActive: 1,
                    // 'recipeLike._id': 1,
                    'recipeLike.isLike': 1,
                    'isRecipeLike.isLike': 1
                }
            }
        ];
        const result = await recipeRepository.aggregate(pipeline).toArray();
        console.log(result,'-------****----------')
        return result?.length > 0 ? result[0] : null;
        // let qb: any = await this.createQueryBuilder('recipe')
        //     .select([
        //         'recipe.id', 'recipe.recipeTitle', 'recipe.makingDuration', 'recipe.indredient', 'recipe.cookingDirection', 'recipe.recipeImage', 'recipe.isActive'
        //         , 'recipeLike.id',
        //         'isRecipeLike.isLike'
        //     ])
        //     .leftJoin('recipe.isRecipeLike', 'isRecipeLike', `isRecipeLike.user_id =:userId AND isRecipeLike.is_recipe =:isRecipe`, { userId: userId, isRecipe: true })
        //     .leftJoin('recipe.recipeLike', 'recipeLike', `recipeLike.is_recipe =:isRecipe`, { isRecipe: true })
        //     .andWhere('recipe.id =:recipeId', { recipeId: recipeId })
        // return qb.getOne()
    }


}
