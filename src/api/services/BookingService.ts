import { Logger, LoggerInterface } from "../../decorators/Logger";
import { Service } from "typedi";
import { OrmRepository } from "typeorm-typedi-extensions";
import { BookingRepository } from "../repositories/BookingRepository";
import { BookingModel } from "../models/BookingModel";
import { Pagination } from "nestjs-typeorm-paginate";
import { BookingAlreadyExist, BookingNotFound } from "../errors/Booking";
import { UserActivePlanRepository } from "../repositories/UserActivePlanRepository";
// import { BookingReq } from "../controllers/requests/Booking";
import { BookingRes } from "../controllers/respons/Booking";
import { Filter } from "../controllers/requests/User";
import { ObjectId } from 'mongodb'


@Service()
export class BookingService {
    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private bookingRepository: BookingRepository,
        @OrmRepository() private userActivePlanRepository: UserActivePlanRepository
    ) {
    }

    /* ----------------- booking info by id ------------------ */
    public async bookingInfoById(params: Filter,res:any): Promise<Pagination<BookingModel[]>> {
        this.log.info('get booking info by id');
        return await this.bookingRepository.bookingInfoById(params,res);
    }

    /* ------------------ add booking by user ------------------ */
    public async addbooking(body: any): Promise<BookingModel> {
        this.log.info(`add booking by user ${body}`);
        const userId = new ObjectId(body.userId);
        body.userId = userId;
        const isAlreadyBookingExist = await this.bookingRepository.isBookingExist(body?.userId, body?.date, body?.timeSlot)
        if (isAlreadyBookingExist)
            throw new BookingAlreadyExist();
        const userActivePlanData = await this.userActivePlanRepository.isExpire(body?.userId);
        if (userActivePlanData)
            body.userType = "paid";
        body.userType = body?.userType ? body?.userType : "free";
        body.isCounsellorConnected = false;
        body.status = null;
        body.dietPlanStatus = 'pending';
        body.addDate = '';
        const res = await this.bookingRepository.save(body);
        res._id = res?._id?.toString()
        res.userId = res?.userId?.toString();
        return res;
    }

    /*  ------------------update booking by admin ---------------  */
    public async updatebooking(updateBody: BookingRes): Promise<BookingModel | {}> {
        this.log.info(`Update booking by admin ${updateBody}`);
        console.log("body", updateBody)
        updateBody._id = new ObjectId(updateBody?._id);
        const isBookingExist = await this.bookingRepository.findOne({ _id: updateBody?._id });
        if (isBookingExist) {
            isBookingExist.status = updateBody?.status;
            isBookingExist.dietPlanStatus = updateBody?.dietPlanStatus;
            isBookingExist.addDate = updateBody?.addDate;
            await this.bookingRepository.save(isBookingExist);
            const res = await this.bookingRepository.findOne(ObjectId(updateBody?._id));
            return res
        }
        throw new BookingNotFound();
    }
}