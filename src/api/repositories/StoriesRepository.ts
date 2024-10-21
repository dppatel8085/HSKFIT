import { EntityRepository, Repository } from "typeorm";
import { StoriesModel } from "../models/StoriesModel";
import { Role } from "../enums/Users";
import { Pagination } from "nestjs-typeorm-paginate";
import { Filter } from "../controllers/requests/User";
import { getMongoRepository } from "typeorm";

@EntityRepository(StoriesModel)
export class StoriesRepository extends Repository<StoriesModel> {
    private storiesRepo=getMongoRepository(StoriesModel)

    public async storiesList(filter: any, roleId: any): Promise<StoriesModel[] | any> {
        const pipeline = [];

        if (roleId != Role.ADMIN) {
            pipeline.push({
                $match: { isActive: true }
            });
        }

        if (filter.q) {
            const regex = new RegExp(filter.q, 'i');
            pipeline.push({
                $match: {
                    storiesTitle: { $regex: regex }
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

        pipeline.push({
            $project: {
                _id: 1,
                storiesTitle: 1,
                storiesImage: 1,
                externalLink: 1,
                storyViewImg: 1,
                storyStartDate: 1,
                storyEndDate: 1,
                isActive: 1
            }
        });

        return await this.storiesRepo.aggregate(pipeline).toArray();


        // const qb = await this.createQueryBuilder('stories')
        //     .select(['stories.id', 'stories.storiesTitle', 'stories.storiesImage', 'stories.externalLink', 'stories.storyViewImg', 'stories.storyStartDate', 'stories.storyEndDate', 'stories.isActive'])
        // if (roleId != Role.ADMIN)
        //     qb.andWhere('stories.is_active=:isActive', { isActive: true })

        // if (filter.q) {
        //     qb.andWhere(`(
        //         stories.storiesTitle LIKE :q 
        // )`, { q: `${filter.q}%` })
        // }

        // if (filter.isActive === 'true') {
        //     qb.andWhere('stories.is_active = :active', { active: true });
        // }
        // else if (filter.isActive === 'false') {
        //     qb.andWhere('stories.is_active = :isActive', { isActive: false });
        // }

        // if (filter.sortField && filter.sortValue) {
        //     qb.orderBy(`stories.${filter.sortField}`, filter.sortValue);
        // } else {
        //     qb.orderBy('stories.updated_at', 'DESC');
        // }

        // return await qb.getMany();
    }


    public async storiesListByAdmin(filter: Filter, roleId: number): Promise<Pagination<StoriesModel[]> | any> {
        const storiesRepository = getMongoRepository(StoriesModel);

        let pipeline: any[] = [];
        let matchStage: any = {};
        if (roleId !== Role.ADMIN) {
            matchStage['isActive'] = true;
        }
        if (filter.q) {
            let regex = new RegExp(filter.q, 'i');
            matchStage['storiesTitle'] = { $regex: regex };
        }
        if (filter.isActive === 'true') {
            matchStage['isActive'] = true;
        } else if (filter.isActive === 'false') {
            matchStage['isActive'] = false;
        }
        if (filter.startDate && filter.endDate) {
            matchStage['storyStartDate'] = {
                $gte: new Date(filter.startDate),
                $lte: new Date(filter.endDate)
            };
        }
        if (Object.keys(matchStage)?.length > 0) {
            pipeline.push({ $match: matchStage });
        }

        pipeline.push({
            $project: {
                id: '$id',
                storiesTitle: '$storiesTitle',
                storiesImage: '$storiesImage',
                externalLink: '$externalLink',
                storyViewImg: '$storyViewImg',
                storyStartDate: '$storyStartDate',
                storyEndDate: '$storyEndDate',
                isActive: '$isActive'
            }
        });
        let sortStage: any = {};
        if (filter.sortField && filter.sortValue) {
            sortStage[`${filter.sortField}`] = filter.sortValue === 'ASC' ? 1 : -1;
        } else {
            sortStage['updatedAt'] = -1;
        }
        pipeline.push({ $sort: sortStage });
        const response = await storiesRepository.aggregate(pipeline).toArray();
        let result = response?.map((ele) => ({ ...ele, _id: ele._id.toString() }));

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

        //     const qb = await this.createQueryBuilder('stories')
        //         .select(['stories.id', 'stories.storiesTitle', 'stories.storiesImage', 'stories.externalLink', 'stories.storyViewImg', 'stories.storyStartDate', 'stories.storyEndDate', 'stories.isActive'])
        //     if (roleId != Role.ADMIN)
        //         qb.andWhere('stories.is_active=:isActive', { isActive: true })

        //     if (filter.q) {
        //         qb.andWhere(`(
        //             stories.storiesTitle LIKE :q 
        //     )`, { q: `${filter.q}%` })
        //     }

        //     if (filter.isActive === 'true') {
        //         qb.andWhere('stories.is_active = :active', { active: true });
        //     }
        //     else if (filter.isActive === 'false') {
        //         qb.andWhere('stories.is_active = :isActive', { isActive: false });
        //     }

        //     if (filter.startDate && filter.endDate) {
        //         qb.andWhere(`stories.story_start_date >= :startDate
        //     AND stories.story_start_date <= :endDate
        // `, { startDate: filter.startDate, endDate: filter.endDate });
        //     }

        //     if (filter.sortField && filter.sortValue) {
        //         qb.orderBy(`stories.${filter.sortField}`, filter.sortValue);
        //     } else {
        //         qb.orderBy('stories.updated_at', 'DESC');
        //     }

        //     const page = !filter.page ? 1 : Number(filter.page);
        //     const limit = !filter.limit ? 10 : Number(filter.limit);
        //     return paginate(qb, { page, limit })
    }

    public async updateStory(): Promise<StoriesModel | void> {
        const dateFrom = new Date();
        const formattedDateFrom = dateFrom.toISOString().split('T')[0];
        await this.storiesRepo.updateMany(
            {
                $expr: {
                    $eq: [
                        { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$storyEndDate" } } },
                        formattedDateFrom
                    ]
                }
            },
            {
                $set: {
                    isActive: false
                }
            }
        );
        
        // await this.createQueryBuilder('stories')
        //     .update('stories')
        //     .set({ isActive: false })
        //     .andWhere(`DATE(stories.story_end_date) = DATE (:endDate)`, { endDate: new Date() })
        //     .execute()
    }

}