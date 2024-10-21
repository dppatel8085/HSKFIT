import { EntityRepository, Repository } from "typeorm";
import { AdminModel } from "../models/AdminModel";
import { Pagination } from "nestjs-typeorm-paginate";
import { Role } from "../enums/Users";
import { Filter } from "../controllers/requests/User";
import { getMongoRepository } from "typeorm";


@EntityRepository(AdminModel)
export class AdminRepository extends Repository<AdminModel> {
    private userRepo = getMongoRepository(AdminModel)

    public async isMobileExist(mobileNumber: string): Promise<AdminModel> {
        return await this.findOne({ mobileNumber: mobileNumber })
    }

    public async getDietitianList(filter: Filter): Promise<Pagination<AdminModel[]> | any> {
        const adminRepository = getMongoRepository(AdminModel);
        let pipeline: any[] = [];
        let matchStage: any = {
            role: Role.DIETITIAN,
        };

        if (filter.q) {
            let regex = new RegExp(filter.q, 'i');
            matchStage.$or = [
                { name: { $regex: regex } },
                { address: { $regex: regex } },
                { email: { $regex: regex } },
                { mobileNumber: { $regex: regex } }
            ];
        }

        if (filter.status === 'true') {
            matchStage.status = true;
        } else if (filter.status === 'false') {
            matchStage.status = false;
        }

        pipeline.push({ $match: matchStage });

        let sortStage: any = {};
        if (filter.sortField && filter.sortValue) {
            sortStage[filter.sortField] = filter.sortValue === 'ASC' ? 1 : -1;
        } else {
            sortStage['createdAt'] = -1;
        }
        pipeline.push({ $sort: sortStage });

        const page = !filter.page ? 1 : Number(filter.page);
        const limit = !filter.limit ? 10 : Number(filter.limit);
        const skip = (page - 1) * limit;
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });

        const response = await adminRepository.aggregate(pipeline).toArray();
        let result = response?.map((ele) => ({ ...ele, _id: ele?._id?.toString(), createdById: ele?.createdById?.toString() }));

        const totalItems = result.length;
        const totalPages = Math.ceil(totalItems / limit);

        const metaData = {
            totalItems: totalItems,
            itemCount: result?.length,
            itemsPerPage: limit,
            totalPages: totalPages,
            currentPage: page
        };

        return {
            items: result,
            meta: metaData
        };

    }

    public async getDietitans(): Promise<AdminModel[] | any> {
        const adminRepository = getMongoRepository(AdminModel);
        let pipeline: any[] = [];
        pipeline.push({
            $match: {
                role: Role.DIETITIAN
            }
        });
        pipeline.push({
            $project: {
                _id: 1,
                name: 1
            }
        });
        const response = await adminRepository.aggregate(pipeline).toArray();
        let result = response?.map((ele) => ({ ...ele, _id: ele?._id?.toString() }));
        return result
        // const qb = await this.createQueryBuilder('admin')
        //     .select(['admin.id', 'admin.name'])
        //     .andWhere('admin.role =:role', { role: Role.DIETITIAN })
        // return qb.getMany()
    }

    public async userOfDietitian(id: string): Promise<AdminModel> {
        const pipeline = [
            {
                $match: {
                    _id: id
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'dietitianId',
                    as: 'users'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    mobileNumber: 1,
                    profilePic: 1,
                    address: 1,
                    status: 1,
                    'users._id': 1,
                    'users.name': 1,
                    'users.age': 1,
                    'users.address': 1,
                    'users.mobileNumber': 1,
                    'users.isCompleted': 1,
                    'users.profilePic': 1
                }
            }
        ];

        const response: any = await this.userRepo.aggregate(pipeline).toArray();
        response[0]._id = response[0]._id?.toString();
        if (response[0]?.users?.length)
            response[0]?.users?.map((ele) => { ele._id = ele?._id?.toString() });
        return response[0]

        // const qb = await this.createQueryBuilder('admin')
        //     .select([
        //         'admin.id', 'admin.name', 'admin.email', 'admin.mobileNumber', 'admin.profilePic', 'admin.address', 'admin.status',
        //         'users.id', 'users.name', 'users.age', 'users.address', 'users.mobileNumber', 'users.isCompleted', 'users.profilePic',
        //     ])
        //     .leftJoin('admin.users', 'users')
        //     .andWhere('admin.id =:id', { id: id })
        // return qb.getOne();
    }

}