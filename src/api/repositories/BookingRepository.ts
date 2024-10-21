import { EntityRepository, Repository } from "typeorm";
import { BookingModel } from "../models/BookingModel";
import { Pagination } from "nestjs-typeorm-paginate";
import { Filter } from "../controllers/requests/User";
import { getMongoRepository } from 'typeorm';
import Excel from 'exceljs';
import { Role } from "../enums/Users";


@EntityRepository(BookingModel)
export class BookingRepository extends Repository<BookingModel> {
    private bookingRepo = getMongoRepository(BookingModel)

    public async bookingInfoById(filter: Filter, res: any): Promise<Pagination<BookingModel[]> | any> {
        const pipeline = [];

        let matchStage = {};

        if (filter.userType) {
            matchStage['userType'] = filter.userType;
        }

        if (filter.status === 'null') {
            matchStage['status'] = null;
        } else if (filter.status) {
            matchStage['status'] = filter.status;
        }

        if (filter.startDate && filter.endDate) {
            matchStage['date'] = { $gte: (filter.startDate), $lte: (filter.endDate) };
        }

        pipeline.push({
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'users'
            }
        });

        pipeline.push({ $unwind: { path: '$users', preserveNullAndEmptyArrays: true } });

        if (filter.q) {
            let regex = new RegExp(filter.q, 'i');
            matchStage = {
                $or: [
                    { 'users.mobileNumber': { $regex: regex } },
                    { 'users.name': { $regex: regex } }
                ]
            };
        }

        if (Object.keys(matchStage)?.length > 0) {
            pipeline.push({ $match: matchStage });
        }

        // Project stage to shape the output
        pipeline.push({
            $project: {
                _id: 1,
                date: 1,
                timeSlot: 1,
                isCounsellorConnected: 1,
                status: 1,
                userType: 1,
                updatedAt: 1,
                createdAt: 1,
                dietPlanStatus: 1,
                addDate: 1,
                'users.id': 1,
                'users.name': 1,
                'users.age': 1,
                'users.address': 1,
                'users.mobileNumber': 1,
                'users.profilePic': 1
            }
        });

        // Sorting stage
        let sortStage = {};
        if (filter.sortField && filter.sortValue) {
            sortStage[`${filter.sortField}`] = filter.sortValue === 'ASC' ? 1 : -1;
        } else {
            sortStage['updatedAt'] = -1;
        }
        pipeline.push({ $sort: sortStage });

        const response = await this.bookingRepo.aggregate(pipeline).toArray();
        let result = response?.map((ele) => ({ ...ele, _id: ele._id.toString() }));

        if (filter.type == 'xlsx') {
            const workbook = new Excel.Workbook();
            const worksheet = workbook.addWorksheet('bookingUsers');
            worksheet.columns = [
                { header: 'name', key: 'name' },
                { header: 'address', key: 'address' },
                { header: 'age', key: 'age' },
                { header: 'mobileNumber', key: 'mobileNumber' },
                { header: 'date ', key: 'date ' },
                { header: 'timeSlot', key: 'timeSlot' },
                { header: 'dietPlanStatus', key: 'dietPlanStatus' },
                { header: 'createdAt', key: 'createdAt' },
                { header: 'isCounsellorConnected', key: 'isCounsellorConnected' },
                { header: 'addDate', key: 'addDate' },
            ]
            result?.forEach(ele => {
                const date = new Date(ele?.createdAt);
                const createdAt = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                worksheet.addRow({
                    name: ele?.users?.name,
                    address: ele?.users?.address,
                    age: ele?.users?.age,
                    mobileNumber: ele?.users?.mobileNumber,
                    date: ele?.date,
                    timeSlot: ele?.timeSlot,
                    dietPlanStatus: ele?.dietPlanStatus,
                    createdAt: createdAt,
                    isCounsellorConnected: ele?.isCounsellorConnected,
                    addDate: ele?.addDate,
                })
            })
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=' + 'booking.xlsx');
            return workbook.xlsx.write(res)
                .then(() => {
                    res.status(200).end();
                });
        }

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



        // const qb = await this.createQueryBuilder('booking')
        //     .select([
        //         'booking.id', 'booking.date', 'booking.timeSlot', 'booking.isCounsellorConnected', 'booking.status', 'booking.userType', 'booking.dietPlanStatus', 'booking.addDate',
        //         'users.id', 'users.name', 'users.age', 'users.address', 'users.mobileNumber', 'users.profilePic'
        //     ])
        //     .leftJoin('booking.users', 'users')

        // if (filter.q) {
        //     qb.andWhere(`(
        //             users.mobileNumber LIKE :q  OR 
        //             users.name LIKE :q  
        //                 )`, { q: `${filter.q}%` });
        // }

        // if (filter.userType) {
        //     qb.andWhere(`(
        //             booking.userType LIKE :userType
        //             )`, { userType: `${filter.userType}` });
        // }

        // if (filter.status == 'null') {
        //     qb.andWhere('booking.status IS NULL')
        // } else if (filter.status) {
        //     qb.andWhere(`(
        //             booking.status LIKE :q  
        //                 )`, { q: `${filter.status}` });
        // }

        // if (filter.startDate && filter.endDate) {
        //     qb.andWhere(`DATE_FORMAT(booking.date, '%y-%m-%d') >= DATE_FORMAT(:dateFrom, '%y-%m-%d')
        //     AND DATE_FORMAT(booking.date, '%y-%m-%d') <= DATE_FORMAT(:dateTo, '%y-%m-%d')
        // `, { dateFrom: filter.startDate, dateTo: filter.endDate });
        // }

        // if (filter.sortField && filter.sortValue) {
        //     qb.orderBy(`booking.${filter.sortField}`, filter.sortValue);
        // } else {
        //     qb.orderBy('booking.updated_at', 'DESC');
        // }

        // const page = !filter.page ? 1 : Number(filter.page);
        // const limit = !filter.limit ? 10 : Number(filter.limit);
        // return paginate(qb, { page, limit });
    }


    public async isBookingExist(userId, date, timeSlot): Promise<BookingModel> {
        const pipeline = [
            {
                $match: {
                    userId: userId,
                    timeSlot: timeSlot,
                    date: date
                }
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    timeSlot: 1,
                }
            }
        ];
        const result = await this.bookingRepo.aggregate(pipeline).toArray();
        return result[0];
        //     const qb = await this.createQueryBuilder('booking')
        //         .andWhere('booking.user_id=:userId', { userId: userId })
        //         .andWhere('booking.time_slot =:timeSlot', { timeSlot: timeSlot })
        //         .andWhere(`DATE_FORMAT(booking.date, '%y-%m-%d') = DATE_FORMAT(:dateFrom, '%y-%m-%d')
        // `, { dateFrom: date });
        //     return qb.getOne()
    }


    public async isBooking(userId: string): Promise<BookingModel | boolean> {
        const qb = await this.findOne({ userId: userId })
        let result = qb ? true : false
        return result
    }

    public async totalBooking(userId: string, roleId: number): Promise<BookingModel | any> {
        if (roleId == Role.DIETITIAN) return 0;
        const pipline = [
            { $count: 'totalBooking' }
        ]
        const totalBooking = await this.bookingRepo.aggregate(pipline).toArray()
        return totalBooking?.length ? totalBooking[0]?.totalBooking : 0;
    }

}