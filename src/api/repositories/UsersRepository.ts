import { EntityRepository, Repository } from "typeorm"
import { UsersModel } from "../models/UsersModel"
import { Pagination } from "nestjs-typeorm-paginate";
import { Filter } from "../controllers/requests/User";
import { getMongoRepository } from 'typeorm';
import Excel from 'exceljs';
import { Role } from "../enums/Users";


@EntityRepository(UsersModel)
export class UsersRepository extends Repository<UsersModel> {
    private userRepo = getMongoRepository(UsersModel);

    public async userListForAdmin(filter: Filter, res: any): Promise<Pagination<UsersModel[]> | any> {
        const userRepository = getMongoRepository(UsersModel);
        let pipeline = [];

        let matchStage = {};
        if (filter.q) {
            let regex = new RegExp(filter.q, 'i');
            matchStage = {
                $or: [
                    { name: { $regex: regex } },
                    { address: { $regex: regex } },
                    { mobileNumber: { $regex: regex } },
                ],
            };
        }

        if (filter.gender) {
            matchStage['gender'] = filter.gender;
        }
        if (filter.isActive === 'true' || filter.isActive === 'false') {
            matchStage['isActive'] = filter.isActive === 'true';
        }
        if (filter.startDate && filter.endDate) {
            matchStage['createdAt'] = {
                $gte: new Date(filter.startDate),
                $lte: new Date(filter.endDate),
            };
        }

        pipeline.push({
            $lookup: {
                from: 'user_active_plan',
                let: { userId: '$_id' },
                pipeline: [
                    { $match: { $expr: { $and: [{ $eq: ['$userId', '$$userId'] }, { $eq: ['$isExpire', false] }] } } },
                ],
                as: 'userActivePlan'
            }
        })
        pipeline.push({ $unwind: { path: '$userActivePlan', preserveNullAndEmptyArrays: true } });

        pipeline.push({
            $lookup: {
                from: 'subscription_plans',
                localField: 'userActivePlan.planId',
                foreignField: '_id',
                as: 'userActivePlan.subsCription',
            },
        });
        pipeline.push({ $unwind: { path: '$userActivePlan.subsCription', preserveNullAndEmptyArrays: true } });

        if (filter.planName) {
            let planNameRegex = new RegExp(filter.planName, 'i');
            matchStage['userActivePlan.subsCription.planName'] = { $regex: planNameRegex };
        }

        pipeline.push({
            $lookup: {
                from: 'admin',
                localField: 'dietitianId',
                foreignField: '_id',
                as: 'dietitian',
            },
        });

        pipeline.push({
            $lookup: {
                from: 'user_info',
                localField: '_id',
                foreignField: 'userId',
                as: 'userInfo'
            }
        })

        pipeline.push({ $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } });
        pipeline.push({
            $addFields: {
                userInfo: {
                    $cond: {
                        if: { $eq: [{ $type: '$userInfo' }, 'object'] },
                        then: {
                            _id: { $toString: '$userInfo._id' },
                            height: { $ifNull: ['$userInfo.height', null] },
                            weight: { $ifNull: ['$userInfo.weight', null] },
                            weightLose: { $ifNull: ['$userInfo.weightLose', null] },
                            previousWeightLose: { $ifNull: ['$userInfo.previousWeightLose', null] },
                            healthCondition: { $ifNull: ['$userInfo.healthCondition', null] }
                        },
                        else: null
                    }
                }
            }
        })

        if (filter.deviceType) {
            matchStage['deviceType'] = filter.deviceType;
        }

        if (filter.age) {
            matchStage['age'] = filter.age;
        }

        if (filter.weight) {
            matchStage['userInfo.weight'] = filter.weight;
        }

        if (filter.height) {
            matchStage['userInfo.height'] = filter.height;
        }

        if (Object.keys(matchStage)?.length > 0) {
            pipeline.push({ $match: matchStage });
        }

        pipeline.push({
            $project: {
                _id: 1,
                name: 1,
                mobileNumber: 1,
                age: 1,
                gender: 1,
                createdAt: 1,
                address: 1,
                isActive: 1,
                isCompleted: 1,
                isCompletedStep: 1,
                role: 1,
                deviceType: 1,
                'userActivePlan._id': 1,
                'userActivePlan.expiredDate': 1,
                'userActivePlan.paymentMode': 1,
                'userActivePlan.activationDate': 1,
                'userActivePlan.subsCription.planName': 1,
                'dietitian._id': 1,
                'dietitian.name': 1,
                'userInfo': 1
            },
        });

        const page = !filter.page ? 1 : Number(filter.page);
        const limit = !filter.limit ? 10 : Number(filter.limit);
        const skip = (page - 1) * limit;
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });

        let sortStage = {};
        if (filter.sortField && filter.sortValue) {
            sortStage[`${filter.sortField}`] = filter.sortValue === 'ASC' ? 1 : -1;
        } else {
            sortStage['createdAt'] = -1;
        }
        pipeline.push({ $sort: sortStage });

        const response = await userRepository.aggregate(pipeline).toArray();
        // let result = response?.map((ele) => ({ ...ele, _id: ele._id.toString() }));
        let result = response?.map((ele) => ({
            ...ele,
            _id: ele._id.toString(),
            dietitian: ele?.dietitian?.length > 0 ? { ...ele.dietitian[0], _id: ele.dietitian[0]._id?.toString() } : null,
            userActivePlan: ele?.userActivePlan?.expiredDate ? { ...ele.userActivePlan, _id: ele.userActivePlan._id?.toString() } : null,
            userInfo: ele?.userInfo ? {
                ...ele.userInfo, weightLose: JSON.parse(ele?.userInfo?.weightLose),
                previousWeightLose: JSON.parse(ele?.userInfo?.previousWeightLose),
                healthCondition: JSON.parse(ele?.userInfo?.healthCondition)
            } : null
        }));

        if (filter.type == 'xlsx') {
            const workbook = new Excel.Workbook();
            const worksheet = workbook.addWorksheet('users');
            worksheet.columns = [
                { header: 'name', key: 'name' },
                { header: 'address', key: 'address' },
                { header: 'age', key: 'age' },
                { header: 'gender', key: 'gender' },
                { header: 'mobileNumber', key: 'mobileNumber' },
                { header: 'createdAt', key: 'createdAt' },
                { header: 'status', key: 'isActive' },
                { header: 'profileCompeted', key: 'isCompleted' },
                { header: 'plan', key: 'plan' },
                { header: 'planExpire', key: 'planExpire' },
                { header: 'dietianName', key: 'dietianName' },
                { header: 'height', key: 'height' },
                { header: 'weight', key: 'weight' },
                { header: 'healthCondition', key: 'healthCondition' },
                { header: 'weightLose', key: 'weightLose' },
                { header: 'previousWeightLose', key: 'previousWeightLose' },
            ]
            result?.forEach(ele => {
                const date = new Date(ele?.createdAt);
                const createdAt = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                worksheet.addRow({
                    name: ele?.name,
                    address: ele?.address,
                    age: ele?.age,
                    gender: ele?.gender,
                    mobileNumber: ele?.mobileNumber,
                    createdAt: createdAt,
                    isActive: ele?.isActive,
                    isCompleted: ele?.isCompleted,
                    plan: ele?.userActivePlan?.subsCription?.planName,
                    planExpire: ele?.userActivePlan?.expiredDate,
                    dietianName: ele?.dietitian?.name,
                    height: ele?.userInfo?.height,
                    weight: ele?.userInfo?.weight,
                    healthCondition: ele?.userInfo?.healthCondition,
                    weightLose: ele?.userInfo?.weightLose,
                    previousWeightLose: ele?.userInfo?.previousWeightLose,
                })
            })
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=' + 'users.xlsx');
            return workbook.xlsx.write(res)
                .then(() => {
                    res.status(200).end();
                });
        }

        const totalDocuments = await userRepository
            .aggregate([{ $match: matchStage }, { $count: 'total' }])
            .toArray();

        const totalCount = totalDocuments[0]?.total || 0;
        const totalPages = Math.ceil(totalCount / limit);

        const metaData = {
            totalItems: totalCount,
            itemCount: result.length,
            itemsPerPage: limit,
            totalPages: totalPages,
            currentPage: page,
        };

        return {
            items: result,
            meta: metaData,
        };

        // const page = Number(filter?.page ?? 1);
        // const limit = Number(filter?.limit ?? 10);
        // const totalItems = result?.length;
        // const totalPages = Math.ceil(totalItems / limit);
        // const startIndex = (page - 1) * limit;
        // const endIndex = startIndex + limit;
        // const paginatedItems = result?.slice(startIndex, endIndex);
        // const metaData = {
        //     totalItems: totalItems,
        //     itemCount: paginatedItems?.length,
        //     itemsPerPage: limit,
        //     totalPages: totalPages,
        //     currentPage: page
        // };
        // return {
        //     items: paginatedItems,
        //     meta: metaData
        // };


        // const qb = this.createQueryBuilder('users')
        //         .select([
        //             'users.id', 'users.name', 'users.mobileNumber', 'users.age', 'users.gender', 'users.createdAt', 'users.address', 'users.isActive', 'users.isCompleted', 'users.isCompletedStep', 'users.role',
        //             'userActivePlan.id', 'userActivePlan.expiredDate', 'userActivePlan.paymentMode', 'userActivePlan.activationDate',
        //             'subsCription.id', 'subsCription.planName',
        //             'dietitan.id', 'dietitan.name',
        //         ])
        //         .leftJoin('users.userActivePlan', 'userActivePlan', `userActivePlan.is_expire=:isExpire`, { isExpire: false })
        //         .leftJoin('userActivePlan.subsCription', 'subsCription')
        //         .leftJoin('users.dietitan', 'dietitan')

        //     if (filter.q) {
        //         qb.andWhere(`(
        //                 users.name LIKE :q OR
        //                 users.address LIKE :q OR
        //                 users.mobileNumber LIKE :q  
        //                 )`, { q: `%${filter.q}%` });
        //     }

        //     if (filter.planName) {
        //         qb.andWhere(`(
        //             subsCription.plan_name LIKE :planName
        //             )`, { planName: `${filter.planName}` });
        //     }

        //     if (filter.gender) {
        //         qb.andWhere(`(
        //             users.gender LIKE :gender
        //             )`, { gender: `${filter.gender}` });
        //     }

        //     if (filter.isActive === 'true') {
        //         qb.andWhere('users.is_active = :active', { active: true });
        //     }
        //     else if (filter.isActive === 'false') {
        //         qb.andWhere('users.is_active = :inActive', { inActive: false });
        //     }

        //     if (filter.startDate && filter.endDate) {
        //         qb.andWhere(`DATE_FORMAT(users.created_at, '%y-%m-%d') >= DATE_FORMAT(:dateFrom, '%y-%m-%d')
        //     AND DATE_FORMAT(users.created_at, '%y-%m-%d') <= DATE_FORMAT(:dateTo, '%y-%m-%d')
        // `, { dateFrom: filter.startDate, dateTo: filter.endDate });
        //     }

        //     if (filter.sortField && filter.sortValue) {
        //         qb.orderBy(`users.${filter.sortField}`, filter.sortValue);
        //     } else {
        //         qb.orderBy('users.created_at', 'DESC');
        //     }
        //     const page = !filter.page ? 1 : Number(filter.page);
        //     const limit = !filter.limit ? 10 : Number(filter.limit);

        //     return paginate(qb, { page, limit });
    }

    public async getFullUserDetailByAdmin(userId: string): Promise<UsersModel> {
        const pipeline = [
            {
                $match: { _id: userId }
            },
            {
                $lookup: {
                    from: 'user_info',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'userInfo'
                }
            },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },  // this line add 
            {
                $lookup: {
                    from: 'admin',
                    localField: 'dietitianId',
                    foreignField: '_id',
                    as: 'dietitian'
                }
            },
            { $unwind: { path: '$dietitian', preserveNullAndEmptyArrays: true } }, // this line add
            {
                $lookup: {
                    from: 'user_active_plan',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$userId', '$$userId'] },
                                        { $eq: ['$isExpire', false] }
                                    ]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'subscription_plans',
                                localField: 'planId',
                                foreignField: '_id',
                                as: 'subscription'
                            }
                        },
                        { $unwind: { path: '$subscription', preserveNullAndEmptyArrays: true } }
                    ],
                    as: 'userActivePlan'
                }
            },
            { $unwind: { path: '$userActivePlan', preserveNullAndEmptyArrays: true } }, // this line add
            {
                $lookup: {
                    from: 'bmi',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'bmi'
                }
            },
            {
                $lookup: {
                    from: 'measurment_tracker',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'measurementTracker'
                }
            },
            {
                $lookup: {
                    from: 'weight_tracker',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'weightTracker'
                }
            },
            {
                $lookup: {
                    from: 'question',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'question'
                }
            },
            {
                $lookup: {
                    from: 'water_tracker',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'waterTracker'
                }
            },
            {
                $addFields: {
                    bmi: {
                        $map: {
                            input: '$bmi',
                            as: 'bmiItem',
                            in: {
                                _id: { $toString: '$$bmiItem._id' },
                                userId: { $toString: '$$bmiItem.userId' },
                                height: '$$bmiItem.height',
                                weight: '$$bmiItem.weight',
                                age: '$$bmiItem.age',
                                createdAt: '$$bmiItem.createdAt',
                                result: '$$bmiItem.result'
                            }
                        }
                    },
                    measurementTracker: {
                        $map: {
                            input: '$measurementTracker',
                            as: 'measurementTrackerItem',
                            in: {
                                _id: { $toString: '$$measurementTrackerItem._id' },
                                userId: { $toString: '$$measurementTrackerItem.userId' },
                                chest: '$$measurementTrackerItem.chest',
                                arm: '$$measurementTrackerItem.arm',
                                waist: '$$measurementTrackerItem.waist',
                                hips: '$$measurementTrackerItem.hips',
                                thigh: '$$measurementTrackerItem.thigh',
                                createdAt: '$$measurementTrackerItem.createdAt',
                                updatedAt: '$$measurementTrackerItem.updatedAt'
                            }
                        }
                    },
                    weightTracker: {
                        $map: {
                            input: '$weightTracker',
                            as: 'weightTrackerItem',
                            in: {
                                _id: { $toString: '$$weightTrackerItem._id' },
                                userId: { $toString: '$$weightTrackerItem.userId' },
                                weightInKg: '$$weightTrackerItem.weightInKg',
                                createdAt: '$$weightTrackerItem.createdAt',
                                updatedAt: '$$weightTrackerItem.updatedAt'
                            }
                        }
                    },
                    question: {
                        $map: {
                            input: '$question',
                            as: 'question',
                            in: {
                                _id: { $toString: '$$question._id' },
                                userId: { $toString: '$$question.userId' },
                                key: '$$question.key',
                                type: '$$question.type',
                                value: '$$question.value',
                                createdAt: '$$question.createdAt',
                                updatedAt: '$$question.updatedAt'
                            }
                        }
                    },
                    waterTracker: {
                        $map: {
                            input: '$waterTracker',
                            as: 'waterTracker',
                            in: {
                                _id: { $toString: '$$waterTracker._id' },
                                userId: { $toString: '$$waterTracker.userId' },
                                waterInGlass: '$$waterTracker.waterInGlass',
                                result: '$$waterTracker.result',
                                createdAt: '$$waterTracker.createdAt',
                                updatedAt: '$$waterTracker.updatedAt'
                            }
                        }
                    },
                    userInfo: {
                        $ifNull: ['$userInfo', null]  // Convert empty userInfo to null
                    },
                    dietitian: {
                        $cond: {
                            if: { $eq: [{ $type: "$dietitian" }, "object"] },
                            then: {
                                _id: { $toString: '$dietitian._id' },
                                name: '$dietitian.name',
                                mobileNumber: '$dietitian.mobileNumber',
                                role: '$dietitian.role',
                                status: '$dietitian.status',
                                email: '$dietitian.email',
                                createdAt: '$dietitian.createdAt'
                            },
                            else: null
                        }
                    },
                    userActivePlan: {
                        $ifNull: ['$userActivePlan', null]  // Convert empty dietitian to null
                    }
                }
            },
            {
                $project: {
                    '_id': 1,
                    'name': 1,
                    'age': 1,
                    'gender': 1,
                    'address': 1,
                    'mobileNumber': 1,
                    'deviceType': 1,
                    'profilePic': 1,
                    'isCompletedStep': 1,
                    'isActive': 1,
                    'userInfo': 1,
                    'dietitian': 1,
                    'userActivePlan': 1,
                    'bmi': '$bmi',
                    'measurementTracker': '$measurementTracker',
                    'weightTracker': '$weightTracker',
                    'question': '$question',
                    'waterTracker': '$waterTracker'
                }
            }
        ];

        const result = await this.userRepo.aggregate(pipeline).toArray();
        const res = result[0];
        res._id = res?._id?.toString();
        if (res?.userInfo) {
            res.userInfo._id = res?.userInfo?._id?.toString();
            res.userInfo.userId = res?.userInfo?.userId?.toString();
            res.userInfo.dietaryPreference = JSON.parse(res?.userInfo?.dietaryPreference || 'null');
            res.userInfo.weightLose = JSON.parse(res?.userInfo?.weightLose || 'null');
            res.userInfo.ledToYourWeightGain = JSON.parse(res?.userInfo?.ledToYourWeightGain || 'null');
            res.userInfo.healthCondition = JSON.parse(res?.userInfo?.healthCondition || 'null');
            res.userInfo.previousWeightLose = JSON.parse(res?.userInfo?.previousWeightLose || 'null');
        }

        return res;

        // const qb = await this.createQueryBuilder('users')
        //     .select([
        //         'users.id', 'users.name', 'users.age', 'users.gender', 'users.address', 'users.mobileNumber', 'users.deviceType', 'users.profilePic', 'users.isCompletedStep', 'users.isActive',
        //         'userInfo.id', 'userInfo.height', 'userInfo.weight', 'userInfo.dietaryPreference', 'userInfo.weightLose', 'userInfo.healthProblem', 'userInfo.healthCondition', 'userInfo.previousWeightLose', 'userInfo.ledToYourWeightGain', 'userInfo.avgDayBusy', 'userInfo.okayWithPaidPlan',
        //         'userActivePlan.id', 'userActivePlan.expiredDate', 'userActivePlan.paymentMode',
        //         'subsCription.id', 'subsCription.planName', 'subsCription.durationInMonth', 'subsCription.planIncludes',
        //         'dietitan.id', 'dietitan.name', 'dietitan.mobileNumber', 'dietitan.address', 'dietitan.status',
        //         'dietitan.email', 
        //         'bmi.id', 'bmi.height', 'bmi.weight', 'bmi.age', 'bmi.createdAt', 'bmi.result',
        //         'measurmentTracker.id', 'measurmentTracker.chest', 'measurmentTracker.arm', 'measurmentTracker.waist', 'measurmentTracker.hips', 'measurmentTracker.thigh', 'measurmentTracker.createdAt',
        //         'weightTracker.id', 'weightTracker.weightInKg', 'weightTracker.createdAt',
        //         'question.id', 'question.key', 'question.value', 'question.type',
        //         'waterTracker.id', 'waterTracker.waterInGlass', 'waterTracker.result', 'waterTracker.createdAt',
        //     ])
        //     .leftJoin('users.userInfo', 'userInfo')
        //     .leftJoin('users.dietitan', 'dietitan')
        //     .leftJoin('users.userActivePlan', 'userActivePlan', `userActivePlan.is_expire=:isExpire`, { isExpire: false })
        //     .leftJoin('userActivePlan.subsCription', 'subsCription')
        //     .leftJoin('users.bmi', 'bmi')
        //     .leftJoin('users.measurmentTracker', 'measurmentTracker')
        //     .leftJoin('users.weightTracker', 'weightTracker')
        //     .leftJoin('users.question', 'question')
        //     .leftJoin('users.waterTracker', 'waterTracker')
        //     .andWhere('users.id=:userId', { userId: userId })

        // const res = await qb.getOne();
        // if (res?.userInfo) {
        //     res.userInfo.dietaryPreference = JSON.parse(res?.userInfo?.dietaryPreference);
        //     res.userInfo.weightLose = JSON.parse(res?.userInfo?.weightLose);
        //     res.userInfo.ledToYourWeightGain = JSON.parse(res?.userInfo?.ledToYourWeightGain)
        //     res.userInfo.healthCondition = JSON.parse(res?.userInfo?.healthCondition);
        //     res.userInfo.previousWeightLose = JSON.parse(res?.userInfo?.previousWeightLose);

        // }
        // return res;
    }


    public async userOfDietitian(dietitianId: String, filter: Filter): Promise<Pagination<UsersModel[] | any>> {
        const userRepository = getMongoRepository(UsersModel);

        const pipeline = [];

        let matchStage: any = {
            dietitianId: dietitianId,
            isActive: true,
        };

        if (filter.q) {
            let regex = new RegExp(filter.q, 'i');
            matchStage.$or = [
                { name: { $regex: regex } },
                { address: { $regex: regex } },
                { mobileNumber: { $regex: regex } }
            ];
        }

        // if (filter.planName) {
        //     matchStage['userActivePlan.subsCription.planName'] = filter.planName;
        // }


        if (filter.startDate && filter.endDate) {
            matchStage['createdAt'] = {
                $gte: new Date(filter.startDate),
                $lte: new Date(filter.endDate)
            };
        }

        // pipeline.push({ $match: matchStage });
        pipeline.push({
            $lookup: {
                from: 'user_active_plan',
                localField: '_id',
                foreignField: 'userId',
                as: 'userActivePlan'
            }
        });

        pipeline.push({ $unwind: { path: '$userActivePlan', preserveNullAndEmptyArrays: true } });
        pipeline.push({
            $match: {
                'userActivePlan.isExpire': false
            }
        });
        pipeline.push({
            $lookup: {
                from: 'subscription_plans',
                localField: 'userActivePlan.planId',
                foreignField: '_id',
                as: 'userActivePlan.subsCription'
            }
        });

        if (filter.planName) {
            let planNameRegex = new RegExp(filter.planName, 'i');
            matchStage['userActivePlan.subsCription.planName'] = { $regex: planNameRegex };
        }
        pipeline.push({ $match: matchStage });

        pipeline.push({
            $project: {
                _id: 1,
                name: 1,
                mobileNumber: 1,
                age: 1,
                gender: 1,
                createdAt: 1,
                address: 1,
                isActive: 1,
                isCompleted: 1,
                isCompletedStep: 1,
                role: 1,
                'userActivePlan._id': 1,
                'userActivePlan.expiredDate': 1,
                'userActivePlan.paymentMode': 1,
                'userActivePlan.activationDate': 1,
                // 'userActivePlan.subsCription._id': 1,
                'userActivePlan.subsCription.planName': 1
            }
        });

        let sortStage = {};
        if (filter.sortField && filter.sortValue) {
            sortStage[`${filter.sortField}`] = filter.sortValue === 'ASC' ? 1 : -1;
        } else {
            sortStage['createdAt'] = -1;
        }
        pipeline.push({ $sort: sortStage });

        const response = await userRepository.aggregate(pipeline).toArray();
        // let result = response?.map((ele) => ({ ...ele, _id: ele._id.toString() }));
        let result = response?.map((ele) => ({
            ...ele,
            _id: ele._id.toString(),
            userActivePlan: ele?.userActivePlan?.expiredDate ? { ...ele.userActivePlan, _id: ele.userActivePlan._id.toString() } : null,
        }));

        const page = !filter.page ? 1 : Number(filter.page);
        const limit = !filter.limit ? 10 : Number(filter.limit);
        const startIndex = (page - 1) * limit;
        const paginatedItems = result.slice(startIndex, startIndex + limit);
        const totalItems = result.length;
        const totalPages = Math.ceil(totalItems / limit);
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


        //     const qb = this.createQueryBuilder('users')
        //         .select([
        //             'users.id', 'users.name', 'users.mobileNumber', 'users.age', 'users.gender', 'users.createdAt', 'users.address', 'users.isActive', 'users.isCompleted', 'users.isCompletedStep', 'users.role',
        //             'userActivePlan.id', 'userActivePlan.expiredDate', 'userActivePlan.paymentMode', 'userActivePlan.activationDate',
        //             'subsCription.id', 'subsCription.planName'
        //         ])
        //         .leftJoin('users.userActivePlan', 'userActivePlan')
        //         .leftJoin('userActivePlan.subsCription', 'subsCription')
        //         .andWhere('users.dietitianId =:dietitianId', { dietitianId: dietitianId })
        //         .andWhere('users.isActive =:isActive', { isActive: true })
        //         .andWhere(`userActivePlan.is_expire=:isExpire`, { isExpire: false })

        //     if (filter.q) {
        //         qb.andWhere(`(
        //                 users.name LIKE :q OR
        //                 users.address LIKE :q OR
        //                 users.mobileNumber LIKE :q  
        //                 )`, { q: `%${filter.q}%` });
        //     }

        //     if (filter.planName) {
        //         qb.andWhere(`(
        //             subsCription.plan_name LIKE :planName
        //             )`, { planName: `${filter.planName}` });
        //     }

        //     if (filter.startDate && filter.endDate) {
        //         qb.andWhere(`DATE_FORMAT(users.created_at, '%y-%m-%d') >= DATE_FORMAT(:dateFrom, '%y-%m-%d')
        //     AND DATE_FORMAT(users.created_at, '%y-%m-%d') <= DATE_FORMAT(:dateTo, '%y-%m-%d')
        // `, { dateFrom: filter.startDate, dateTo: filter.endDate });
        //     }

        //     if (filter.sortField && filter.sortValue) {
        //         qb.orderBy(`users.${filter.sortField}`, filter.sortValue);
        //     } else {
        //         qb.orderBy('users.created_at', 'DESC');
        //     }
        //     const page = !filter.page ? 1 : Number(filter.page);
        //     const limit = !filter.limit ? 10 : Number(filter.limit);
        //     return paginate(qb, { page, limit });
    }

    public async notificationUsers(userIds): Promise<UsersModel[]> {
        let userId = userIds?.map((ele) => (ele?.toString()))
        const users = await this.userRepo.find({
            where: {
                id: { $in: userId }
            },
            select: ['_id', 'deviceToken']
        });

        return users;
        // const qb = await this.createQueryBuilder('users')
        //     .select(['users.id', 'users.deviceToken'])
        //     .andWhere('users.id IN (:...userIds)', { userIds: userIds })
        // return qb.getMany()
    }

    public async allNotificationUsers(): Promise<UsersModel[]> {
        const users = await this.userRepo.find({
            where: {
                deviceToken: { $ne: null }
            },
            select: ['_id', 'deviceToken']
        });
        return users;
        // const qb = await this.createQueryBuilder('users')
        //     .select(['users.id', 'users.deviceToken'])
        //     .andWhere('users.device_token IS NOT NULL')
        // return qb.getMany()
    }

    public async dietPlanOfUser(userId, filter: Filter): Promise<UsersModel | any> {

        const pipeline = [
            {
                $match: {
                    _id: userId
                }
            },
            {
                $lookup: {
                    from: 'user_active_plan',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$userId', '$$userId'] },
                                        { $eq: ['$isExpire', false] }
                                    ]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'subscription_plans',
                                localField: 'planId',
                                foreignField: '_id',
                                as: 'subscription'
                            }
                        },
                        {
                            $unwind: {
                                path: '$subscription',
                                preserveNullAndEmptyArrays: true
                            }
                        }
                    ],
                    as: 'userActivePlan'
                }
            },
            {
                $unwind: {
                    path: '$userActivePlan',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'diet_plans',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'dietPlan'
                }
            },
            {
                $addFields: {
                    userActivePlan: {
                        $cond: {
                            if: { $eq: [{ $type: "$userActivePlan" }, "object"] },
                            then: {
                                _id: { $toString: '$userActivePlan._id' },
                                expiredDate: '$userActivePlan.expiredDate',
                                subscription: {
                                    _id: { $toString: '$userActivePlan.subscription._id' },
                                    planName: '$userActivePlan.subscription.planName',
                                    durationInMonth: '$userActivePlan.subscription.durationInMonth',
                                    planIncludes: '$userActivePlan.subscription.planIncludes',
                                    status: '$userActivePlan.subscription.status',
                                    createdAt: '$userActivePlan.subscription.createdAt',
                                    updatedAt: '$userActivePlan.subscription.updatedAt'
                                }
                            },
                            else: null
                        }
                    },
                }
            },

            {
                $project: {
                    _id: 1,
                    name: 1,
                    mobileNumber: 1,
                    age: 1,
                    gender: 1,
                    createdAt: 1,
                    address: 1,
                    isActive: 1,
                    profilePic: 1,
                    isCompleted: 1,
                    isCompletedStep: 1,
                    deviceToken: 1,
                    deviceType: 1,
                    role: 1,
                    userActivePlan: 1,
                    dietPlan: 1
                }
            }
        ];


        const result: any = await this.userRepo.aggregate(pipeline).toArray();
        return result?.length > 0 ? result[0] : null;


        // const qb = this.createQueryBuilder('users')
        //     .select([
        //         'users.id', 'users.name', 'users.mobileNumber', 'users.age', 'users.gender', 'users.createdAt', 'users.address', 'users.isActive', 'users.isCompleted', 'users.isCompletedStep', 'users.role',
        //         'userActivePlan.id', 'userActivePlan.expiredDate', 'userActivePlan.paymentMode',
        //         'subsCription.id', 'subsCription.planName',
        //         'dietPlan.id', 'dietPlan.days', 'dietPlan.mealIncluded', 'dietPlan.mealExcluded', 'dietPlan.time',
        //     ])
        //     .leftJoin('users.userActivePlan', 'userActivePlan', `userActivePlan.is_expire=:isExpire`, { isExpire: false })
        //     .leftJoin('userActivePlan.subsCription', 'subsCription')
        //     .leftJoin('users.dietPlan', 'dietPlan')
        //     .andWhere('users.id =:userId', { userId: userId })

        // return qb.getOne();
    }

    public async getUserData(userId: string): Promise<UsersModel> {

        const pipeline = [
            {
                $match: {
                    _id: userId
                }
            },
            {
                $lookup: {
                    from: 'user_active_plan',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$userId', '$$userId'] },
                                        { $eq: ['$isExpire', false] }
                                    ]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'subscription_plans',
                                let: { planId: '$planId' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$_id', '$$planId']
                                            }
                                        }
                                    },
                                    {
                                        $addFields: {
                                            planName: { $ifNull: ['$planName', null] },
                                            durationInMonth: { $ifNull: ['$durationInMonth', null] }
                                        }
                                    }
                                ],
                                as: 'subsCription'
                            }
                        },
                        {
                            $addFields: {
                                subsCription: {
                                    $ifNull: [{ $arrayElemAt: ['$subsCription', 0] }, {
                                        _id: null,
                                        planName: null,
                                        durationInMonth: null
                                    }]
                                }
                            }
                        }
                    ],
                    as: 'userActivePlan'
                }
            },
            {
                $addFields: {
                    userActivePlan: {
                        $ifNull: [{ $arrayElemAt: ['$userActivePlan', 0] }, {
                            _id: null,
                            expiredDate: null,
                            subsCription: {
                                _id: null,
                                planName: null,
                                durationInMonth: null
                            }
                        }]
                    }
                }
            },

            {
                $project: {
                    _id: 1,
                    userId: 1,
                    name: 1,
                    mobileNumber: 1,
                    age: 1,
                    gender: 1,
                    createdAt: 1,
                    address: 1,
                    isActive: 1,
                    profilePic: 1,
                    isCompleted: 1,
                    isSkip: 1,
                    isCompletedStep: 1,
                    deviceToken: 1,
                    deviceType: 1,
                    role: 1,
                    'userActivePlan._id': 1,
                    'userActivePlan.expiredDate': 1,
                    'userActivePlan.subsCription._id': 1,
                    'userActivePlan.subsCription.planName': 1,
                    'userActivePlan.subsCription.durationInMonth': 1,
                }
            }
        ];

        const result = await this.userRepo.aggregate(pipeline).toArray();
        if (result[0].userActivePlan?.expiredDate) {
            result[0].userActivePlan._id = result[0].userActivePlan._id?.toString();
            result[0].userActivePlan.subsCription._id = result[0].userActivePlan.subsCription._id?.toString();
        } else {
            result[0].userActivePlan = null;
        }
        return result[0];


        // const qb = await this.createQueryBuilder('users')
        //     .select(['users',
        //         'userActivePlan.id', 'userActivePlan.expiredDate',
        //         'subsCription.id', 'subsCription.planName', 'subsCription.durationInMonth'
        //     ])
        //     .leftJoin('users.userActivePlan', 'userActivePlan', `userActivePlan.is_expire=:isExpire`, { isExpire: false })
        //     .leftJoin('userActivePlan.subsCription', 'subsCription')
        //     .andWhere('users.id =:userId', { userId: userId })
        // return qb.getOne()
    }

    public async dietPendingList(filter: Filter): Promise<UsersModel[] | any> {
        const pipeline = [
            {
                $lookup: {
                    from: 'user_active_plan',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'userActivePlan'
                }
            },
            {
                $lookup: {
                    from: 'admin',
                    localField: 'dietitianId',
                    foreignField: '_id',
                    as: 'dietitan'
                }
            },
            {
                $unwind: {
                    path: '$userActivePlan',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: '$dietitan',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    mobileNumber: 1,
                    age: 1,
                    gender: 1,
                    createdAt: 1,
                    address: 1,
                    isActive: 1,
                    isCompleted: 1,
                    isCompletedStep: 1,
                    role: 1,
                    'userActivePlan._id': 1,
                    'dietitan._id': 1,
                    'dietitan.name': 1
                }
            }
        ] as any;

        if (filter.q) {
            pipeline.push({
                $match: {
                    $or: [
                        { name: { $regex: `${filter.q}`, $options: 'i' } },
                        { address: { $regex: `${filter.q}`, $options: 'i' } },
                        { mobileNumber: { $regex: `${filter.q}`, $options: 'i' } }
                    ]
                }
            });
        }

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

        if (filter.startDate && filter.endDate) {
            pipeline.push({
                $match: {
                    createdAt: {
                        $gte: new Date(filter.startDate),
                        $lte: new Date(filter.endDate)
                    }
                }
            });
        }

        if (filter.sortField && filter.sortValue) {
            const sortOrder = filter.sortValue.toLowerCase() === 'asc' ? 1 : -1;
            pipeline.push({
                $sort: {
                    [`${filter.sortField}`]: sortOrder
                }
            });
        } else {
            pipeline.push({
                $sort: {
                    updatedAt: -1
                }
            });
        }

        const response = await this.userRepo.aggregate(pipeline).toArray();
        let result = response?.map((ele) => ({ ...ele, _id: ele._id?.toString() }));
        return result;

        // const qb = await this.createQueryBuilder('users')
        //     .select([
        //         'users.id', 'users.name', 'users.mobileNumber', 'users.age', 'users.gender', 'users.createdAt', 'users.address', 'users.isActive', 'users.isCompleted', 'users.isCompletedStep', 'users.role',
        //         'userActivePlan.id',
        //         'dietitan.id', 'dietitan.name',
        //     ])
        //     .leftJoin('users.userActivePlan', 'userActivePlan')
        //     .leftJoin('users.dietitan', 'dietitan')

        // if (filter.q) {
        //     qb.andWhere(`(
        //                 users.name LIKE :q OR
        //                 users.address LIKE :q OR
        //                 users.mobileNumber LIKE :q  
        //                 )`, { q: `${filter.q}%` });
        // }

        // if (filter.isActive === 'true') {
        //     qb.andWhere('users.isActive = :active', { active: true });
        // } else if (filter.isActive === 'false') {
        //     qb.andWhere('users.isActive = :inActive', { inActive: false });
        // }

        // if (filter.startDate && filter.endDate) {
        //     qb.andWhere(`DATE_FORMAT(users.created_at, '%y-%m-%d') >= DATE_FORMAT(:dateFrom, '%y-%m-%d')
        //     AND DATE_FORMAT(users.created_at, '%y-%m-%d') <= DATE_FORMAT(:dateTo, '%y-%m-%d')
        // `, { dateFrom: filter.startDate, dateTo: filter.endDate });
        // }

        // if (filter.sortField && filter.sortValue) {
        //     qb.orderBy(`users.${filter.sortField}`, filter.sortValue);
        // } else {
        //     qb.orderBy('users.updatedAt', 'DESC');
        // }

        // return qb.getMany();
    }

    public async disableUSer(mobileNumber: string): Promise<UsersModel | void> {
        const currentDate = new Date();
        const futureDate = new Date(currentDate);
        futureDate.setDate(futureDate.getDate() + 46);

        await this.userRepo.updateMany(
            { mobileNumber: mobileNumber },
            {
                $set: {
                    updatedAt: currentDate
                }
            }
        );
        await this.userRepo.updateMany(
            { mobileNumber: mobileNumber },
            {
                $set: {
                    updatedAt: futureDate,
                    isActive: false
                }
            }
        );

        // const qb = await this.createQueryBuilder('users');
        // await
        //     qb
        //         .update()
        //         .set({ updatedAt: currentDate })
        //         .where('mobileNumber = :mobileNumber', { mobileNumber })
        //         .execute();

        // const futureDate = new Date(currentDate);
        // futureDate.setDate(futureDate.getDate() + 46);

        // await
        //     qb
        //         .update()
        //         .set({ updatedAt: futureDate, isActive: false })
        //         .where('mobileNumber = :mobileNumber', { mobileNumber })
        //         .execute();
    }


    public async adminUserList(): Promise<UsersModel[] | any> {
        const pipeline = [
            {
                $addFields: {
                    _id: { $toString: '$_id' },
                    dietitianId: { $toString: '$dietitianId' },
                }
            }, {
                $project: {
                    _id: 1,
                    role: 1,
                    gender: 1,
                    age: 1,
                    isCompleted: 1,
                    isActive: 1,
                    mobileNumber: 1,
                    name: 1,
                    dietitianId: 1,
                    deviceToken: 1,
                    address: 1,
                    createdAt: 1,
                }
            }
        ];
        const response = await this.userRepo.aggregate(pipeline).toArray();
        return response;

    }

    public async userList(dietitian1Id: string): Promise<UsersModel[] | any> {

        const pipeline = [
            {
                $match: {
                    dietitianId: dietitian1Id,
                    isActive: true
                }
            },
            {
                $lookup: {
                    from: 'user_active_plan',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'userActivePlan'
                }
            },
            {
                $unwind: '$userActivePlan'
            },
            {
                $match: {
                    'userActivePlan.isExpire': false
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    dietitianId: 1,
                    isActive: 1,
                    'userActivePlan._id': 1,
                    'userActivePlan.activationDate': 1,
                    'userActivePlan.expiredDate': 1,
                    'userActivePlan.paymentMode': 1,
                    'userActivePlan.isExpire': 1,
                    'userActivePlan.createdAt': 1,
                    'userActivePlan.updatedAt': 1,
                    'userActivePlan.planActivatedById': 1,
                    // userActivePlan: 1

                }
            }
        ];
        const response = await this.userRepo.aggregate(pipeline).toArray();
        let result = response?.map((ele) => ({ ...ele, _id: ele._id?.toString(), dietitianId: ele?.dietitianId?.toString(), userActivePlan: ele?.userActivePlan?.expiredDate ? { ...ele.userActivePlan, _id: ele.userActivePlan?._id?.toString() } : null }));
        return result;



        // const qb = this.createQueryBuilder('users')
        //     .leftJoin('users.userActivePlan', 'userActivePlan')
        //     .andWhere('users.dietitianId =:dietitianId', { dietitianId: dietitianId })
        //     .andWhere('users.isActive =:isActive', { isActive: true })
        //     .andWhere(`userActivePlan.is_expire=:isExpire`, { isExpire: false })
        // return qb.getMany();
    }

    public async userDelete(): Promise<UsersModel | void> {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        await this.userRepo.deleteMany(
            {
                $expr: {
                    $eq: [
                        { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
                        { $dateToString: { format: "%Y-%m-%d", date: futureDate } }
                    ]
                }
            },
        );

        // await this.createQueryBuilder('users')
        //     .softDelete()
        //     .from('users')
        //     .andWhere(`DATE_FORMAT(users.updated_at ,'%y-%m-%d') = DATE_FORMAT(:dateFrom,'%y-%m-%d')`, {
        //         dateFrom: futureDate
        //     })
        //     .execute()
    }


    public async totalUser(userId: string, roleId: number): Promise<UsersModel | any> {

        const pipline = [];
        if (roleId == Role.DIETITIAN) {
            pipline.push({ $match: { dietitianId: userId } })
        }
        pipline.push({ $count: "totalUsers" })
        const count = await this.userRepo.aggregate(pipline).toArray();
        const totalUserCount = count?.length ? count[0]?.totalUsers : 0;

        const activeUser = [];
        if (roleId == Role.DIETITIAN) {
            activeUser.push({ $match: { dietitianId: userId } })
        }
        activeUser.push({ $match: { isActive: true } })
        activeUser.push({ $count: "totalUsers" })
        const activeCount = await this.userRepo.aggregate(activeUser).toArray();
        const activeUserCount = activeCount?.length ? activeCount[0]?.totalUsers : 0;

        const inActiveUser = [];
        if (roleId == Role.DIETITIAN) {
            inActiveUser.push({ $match: { dietitianId: userId } })
        }
        inActiveUser.push({ $match: { isActive: false } })
        inActiveUser.push({ $count: "totalUsers" })
        const inActiveCount = await this.userRepo.aggregate(inActiveUser).toArray();
        const inActiveUserCount = inActiveCount?.length ? inActiveCount[0]?.totalUsers : 0;

        return { totalUserCount, activeUserCount, inActiveUserCount }

    }

    public async userxlsx(filter: any): Promise<UsersModel[] | any> {
        const pipeline = [];
        if (filter?.startDate && filter?.endDate) {
            pipeline.push({
                $match: {
                    createdAt: {
                        $gte: new Date(filter.startDate),
                        $lte: new Date(filter.endDate)
                    }
                }
            })
        }
        pipeline.push(
            {
                $lookup: {
                    from: 'user_info',
                    let: { userId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$userId', '$$userId'] } } },
                    ],
                    as: 'userInfo'
                }
            },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'user_active_plan',
                    let: { userId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$userId', '$$userId'] }, { $eq: ['$isExpire', false] }] } } },
                        {
                            $lookup: {
                                from: 'subscription_plans',
                                localField: 'planId',
                                foreignField: '_id',
                                as: 'subsCription'
                            }
                        },
                        { $unwind: { path: '$subsCription', preserveNullAndEmptyArrays: true } }
                    ],
                    as: 'userActivePlan'
                }
            },
            { $unwind: { path: '$userActivePlan', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'admin',
                    localField: 'dietitianId',
                    foreignField: '_id',
                    as: 'dietitian',
                },
            },
            { $unwind: { path: '$dietitian', preserveNullAndEmptyArrays: true } },

            {
                $addFields: {
                    _id: { $toString: '$_id' },
                    dietitianId: { $toString: '$dietitianId' },

                            userInfo: {
                                $cond: {
                                    if: { $eq: [{ $type: '$userInfo' }, 'object'] },
                                    then: {
                                        _id: { $toString: '$userInfo._id' },
                                        height: { $ifNull: ['$userInfo.height', null] },
                                        weight: { $ifNull: ['$userInfo.weight', null] },
                                        weightLose: { $ifNull: ['$userInfo.weightLose', null] },
                                        previousWeightLose: { $ifNull: ['$userInfo.previousWeightLose', null] },
                                        healthCondition: { $ifNull: ['$userInfo.healthCondition', null] }
                                    },
                                    else: null
                                }
                            },
                    dietitian: {
                        $cond: {
                            if: { $eq: [{ $type: '$dietitian' }, 'object'] },
                            then: {
                                _id: { $toString: '$dietitian._id' },
                                name: '$dietitian.name'
                            },
                            else: null
                        }
                    },
                    userActivePlan: {
                        $cond: {
                            if: { $eq: [{ $type: '$userActivePlan' }, 'object'] },
                            then: {
                                _id: { $toString: '$userActivePlan._id' },
                                expiredDate: '$userActivePlan.expiredDate',
                                paymentMode: '$userActivePlan.paymentMode',
                                activationDate: '$userActivePlan.activationDate',
                                subsCription: {
                                    planName: '$userActivePlan.subsCription.planName'
                                }
                            },
                            else: null
                        }
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    role: 1,
                    gender: 1,
                    age: 1,
                    isCompleted: 1,
                    isActive: 1,
                    mobileNumber: 1,
                    name: 1,
                    dietitianId: 1,
                    deviceToken: 1,
                    address: 1,
                    createdAt: 1,
                    'userActivePlan': 1,
                    'dietitian': 1,
                    'userInfo': 1
                }
            }
        )
        const response = await this.userRepo.aggregate(pipeline).toArray();
        return response;

    }


}




