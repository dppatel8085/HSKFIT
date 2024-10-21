import { EntityRepository, Repository } from "typeorm";
import { TransformationModel } from "../models/TransformationModel";
import { Role } from "../enums/Users";
import { Pagination } from "nestjs-typeorm-paginate";
import { Filter } from "../controllers/requests/User";
import { getMongoRepository } from 'typeorm'

@EntityRepository(TransformationModel)
export class TransformationRepository extends Repository<TransformationModel> {

    private transformationRepo = getMongoRepository(TransformationModel);

    public async transformationList(filter: Filter, roleId: number): Promise<Pagination<TransformationModel[]> | any> {
        let pipeline: any[] = [];
        let matchStage: any = {};
        if (filter.q) {
            let regex = new RegExp(filter.q, 'i');
            matchStage['title'] = { $regex: regex };
        }
        if (filter.isActive === 'true') {
            matchStage['isActive'] = true;
        } else if (filter.isActive === 'false') {
            matchStage['isActive'] = false;
        }
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }
        pipeline.push({
            $lookup: {
                from: 'recipe_like',
                localField: 'recipeId',
                foreignField: '_id',
                as: 'recipeLike'
            }
        })
        pipeline.push({
            $project: {
                _id: '$_id',
                title: '$title',
                shortDesc: '$shortDesc',
                longDesc: '$longDesc',
                image: '$image',
                isActive: '$isActive',
                externalLink: '$externalLink',
                recipeLike: {
                    $filter: {
                        input: '$recipeLike',
                        as: 'recipeLike',
                        cond: { $eq: ['$$recipeLike.isRecipe', false] }
                    }
                }
            }
        });

        let sortStage: any = {};
        if (filter.sortField && filter.sortValue) {
            sortStage[filter.sortField] = filter.sortValue === 'ASC' ? 1 : -1;
        } else {
            sortStage['updatedAt'] = -1;
        }
        pipeline.push({ $sort: sortStage });
        const result = await this.transformationRepo.aggregate(pipeline).toArray();
        // let result = response?.map((ele) => ({ ...ele, _id: ele._id?.toString() }));


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
        }
        // const qb = await this.createQueryBuilder('transformation')
        //     .select([
        //         'transformation.id', 'transformation.title', 'transformation.shortDesc', 'transformation.longDesc', 'transformation.image', 'transformation.isActive', 'transformation.externalLink',
        //         'recipeLike.id'
        //     ])
        //     .leftJoin('transformation.recipeLike', 'recipeLike', `recipeLike.is_recipe =:isRecipe`, { isRecipe: false })

        // if (filter.q) {
        //     qb.andWhere(`(
        //         transformation.title LIKE :q
        //             )`, { q: `${filter.q}%` });
        // }

        // if (filter.isActive === 'true') {
        //     qb.andWhere('transformation.is_active = :active', { active: true });
        // }
        // else if (filter.isActive === 'false') {
        //     qb.andWhere('transformation.is_active = :inActive', { inActive: false });
        // }

        // const page = !filter.page ? 1 : Number(filter.page);
        // const limit = !filter.limit ? 10 : Number(filter.limit);

        // if (filter.sortField && filter.sortValue) {
        //     qb.orderBy(`transformation.${filter.sortField}`, filter.sortValue);
        // } else {
        //     qb.orderBy('transformation.updated_at', 'DESC');
        // }

        // return paginate(qb, { page, limit })
    }

    public async getTransformationData(filter: any, roleId: number, userId: number): Promise<TransformationModel[] | any> {
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
                    title: { $regex: regex }
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
                                    { $eq: ['$isRecipe', false] },
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

        pipeline.push({
            $addFields: {
                likeCount: {
                    $size: {
                        $filter: {
                            input: '$recipeLike',
                            as: 'like',
                            cond: { $eq: ['$$like.isRecipe', false] }
                        }
                    }
                },
                recipeLike: {
                    $ifNull: [{ $arrayElemAt: ['$recipeLike', 0] }, { isLike: null }]
                }
            }
        });

        pipeline.push({
            $project: {
                _id: 1,
                title: 1,
                shortDesc: 1,
                longDesc: 1,
                image: 1,
                isActive: 1,
                externalLink: 1,
                likeCount: 1,
                'recipeLike.isLike': 1
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

        const res = await this.transformationRepo.aggregate(pipeline).toArray();

        const result = res?.map((ele) => ({
            _id: ele?._id?.toString(),
            title: ele?.title,
            shortDesc: ele?.shortDesc,
            longDesc: ele?.longDesc,
            image: ele?.image,
            externalLink: ele?.externalLink,
            isActive: ele?.isActive,
            likeCount: Number(ele?.likeCount),
            isLike: ele?.recipeLike?.isLike
        }));

        return result;


        // const qb = await this.createQueryBuilder('transformation')
        //     .select([
        //         'transformation.id', 'transformation.title', 'transformation.shortDesc', 'transformation.longDesc', 'transformation.image', 'transformation.isActive', 'transformation.externalLink',
        //         `(SELECT COUNT(*) FROM recipe_like WHERE recipe_like.recipe_id = transformation.id AND recipe_like.is_recipe = false) AS likeCount`
        //         , 'recipeLike.isLike',
        //     ])
        //     .leftJoin('transformation.recipeLike', 'recipeLike', `recipeLike.is_recipe =:isRecipe AND recipeLike.user_id =:userId`, { isRecipe: false, userId: userId })

        // if (Role.ADMIN != roleId)
        //     qb.andWhere('transformation.is_active =:isActive', { isActive: true })

        // if (filter.q) {
        //     qb.andWhere(`(
        //         transformation.title LIKE :q
        //             )`, { q: `${filter.q}%` });
        // }

        // if (filter.isActive === 'true') {
        //     qb.andWhere('transformation.is_active = :active', { active: true });
        // }
        // else if (filter.isActive === 'false') {
        //     qb.andWhere('transformation.is_active = :inActive', { inActive: false });
        // }

        // if (filter.sortField && filter.sortValue) {
        //     qb.orderBy(`transformation.${filter.sortField}`, filter.sortValue);
        // } else {
        //     qb.orderBy('transformation.updated_at', 'DESC');
        // }

        // let res = await qb.getRawMany()
        // let result = res.map((ele) => {
        //     return {
        //         id: ele?.transformation_id,
        //         title: ele?.transformation_title,
        //         shortDesc: ele?.transformation_short_desc,
        //         longDesc: ele?.transformation_long_desc,
        //         image: ele?.transformation_image,
        //         isActive: ele?.transformation_is_active,
        //         likeCount: Number(ele?.likeCount),
        //         isLike: ele?.recipeLike_is_like
        //     }
        // })
        // return result;

    }

    public async transformationListByUser(filter: Filter, roleId: number, userId: string): Promise<Pagination<TransformationModel[]> | any> {

        const pipeline = [];
        const matchStage = {
            $match: {}
        };

        if (filter.isActive === 'true' || filter.isActive === 'false') {
            matchStage.$match['isActive'] = filter.isActive === 'true';
        }

        if (filter.q) {
            matchStage.$match['title'] = { $regex: new RegExp(`^${filter.q}`, 'i') };
        }

        if (Role.ADMIN != roleId) {
            matchStage.$match['isActive'] = true;
        }

        pipeline.push(matchStage);

        pipeline.push({
            $lookup: {
                from: 'recipe_like',
                let: { recipeId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$userId', userId] },
                                    { $eq: ['$isRecipe', false] },
                                    { $eq: ['$recipeId', '$$recipeId'] }
                                ]
                            }
                        }
                    },
                    {
                        $project: { isLike: 1 }
                    }
                ],
                as: 'isRecipeLike'
            }
        });
        pipeline.push({
            $project: {
                _id: 1,
                title: 1,
                shortDesc: 1,
                longDesc: 1,
                image: 1,
                isActive: 1,
                externalLink: 1,
                'isRecipeLike.isLike': 1,
            }
        });

        const sortStage = {};
        if (filter.sortField && filter.sortValue) {
            sortStage[`${filter.sortField}`] = filter.sortValue === 'ASC' ? 1 : -1;
        } else {
            sortStage['updatedAt'] = -1;
        }
        pipeline.push({ $sort: sortStage });

        const result = await this.transformationRepo.aggregate(pipeline).toArray()
        // console.log(response,"----------------")
        // let result = response?.map((ele) => ({ ...ele, _id: ele._id?.toString() }));

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
        }

        // const qb = await this.createQueryBuilder('transformation')
        //     .select([
        //         'transformation.id', 'transformation.title', 'transformation.shortDesc', 'transformation.longDesc', 'transformation.image', 'transformation.isActive', 'transformation.externalLink',
        //         'recipeLike.id',
        //         'isRecipeLike.isLike'
        //     ])
        //     .leftJoin('transformation.isRecipeLike', 'isRecipeLike', `isRecipeLike.user_id =:userId AND isRecipeLike.is_recipe =:isRecipe`, { userId: userId, isRecipe: false })
        //     .leftJoin('transformation.recipeLike', 'recipeLike', `recipeLike.is_recipe =:isRecipe`, { isRecipe: false })

        // if (Role.ADMIN != roleId)
        //     qb.andWhere('transformation.is_active =:isActive', { isActive: true })

        // if (filter.q) {
        //     qb.andWhere(`(
        //         transformation.title LIKE :q
        //             )`, { q: `${filter.q}%` });
        // }

        // if (filter.isActive === 'true') {
        //     qb.andWhere('transformation.is_active = :active', { active: true });
        // }
        // else if (filter.isActive === 'false') {
        //     qb.andWhere('transformation.is_active = :inActive', { inActive: false });
        // }

        // const page = !filter.page ? 1 : Number(filter.page);
        // const limit = !filter.limit ? 10 : Number(filter.limit);

        // if (filter.sortField && filter.sortValue) {
        //     qb.orderBy(`transformation.${filter.sortField}`, filter.sortValue);
        // } else {
        //     qb.orderBy('transformation.updated_at', 'DESC');
        // }

        // return paginate(qb, { page, limit })
    }

    public async transformationById(transformationId: string, userId: string): Promise<TransformationModel | any> {
        const pipeline = [
            {
                $match: {
                    _id: transformationId
                }
            },
            {
                $lookup: {
                    from: 'recipe_like',
                    let: { recipeId: '$_id', userId: userId },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$userId', userId] },
                                        { $eq: ['$isRecipe', false] },
                                        { $eq: ['$recipeId', '$$recipeId'] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                isLike: 1
                            }
                        }
                    ],
                    as: 'isRecipeLike'
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    shortDesc: 1,
                    longDesc: 1,
                    image: 1,
                    isActive: 1,
                    externalLink: 1,
                    'isRecipeLike.isLike': 1,
                }
            }
        ];

        const result = await this.transformationRepo.aggregate(pipeline).toArray();
        return result?.length > 0 ? result[0] : null; // Return first result or null if not found
        // const qb = await this.createQueryBuilder('transformation')
        //     .select([
        //         'transformation.id', 'transformation.title', 'transformation.shortDesc', 'transformation.longDesc', 'transformation.image', 'transformation.isActive', 'transformation.externalLink',
        //         'recipeLike.id',
        //         'isRecipeLike.isLike'
        //     ])
        //     .leftJoin('transformation.isRecipeLike', 'isRecipeLike', `isRecipeLike.user_id =:userId AND isRecipeLike.is_recipe =:isRecipe`, { userId: userId, isRecipe: false })
        //     .leftJoin('transformation.recipeLike', 'recipeLike', `recipeLike.is_recipe =:isRecipe`, { isRecipe: false })
        //     .andWhere('transformation.id =:transformationId', { transformationId: transformationId })
        // return qb.getOne()
    }


}