import { Authorized, Body, Get, JsonController, Patch, Post, QueryParams, Req, Res } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { BookingService } from "../services/BookingService";
import { Service } from "typedi";
import { UserRoles } from "../enums/Users";
import { BookingModel } from "../models/BookingModel";
import { Pagination } from "nestjs-typeorm-paginate";
import { DecodeTokenService } from "../services/DecodeTokenService";
import { BookingReq } from "./requests/Booking";
import { validateOrReject } from "class-validator";
import { BookingRes } from "./respons/Booking";
import { Filter } from "./requests/User";

@OpenAPI({ security: [{ bearerAuth: [] }] })
@JsonController('/booking')

export class BookingController {
    constructor(
        @Service() private bookingService: BookingService,
        @Service() private decodeTokenService: DecodeTokenService
    ) {
    }

    @Authorized(UserRoles.ADMIN)
    @Get('/list')
    @ResponseSchema(BookingModel, {
        description: 'booking info by id',
    })
    public async bookingInfoById(@QueryParams() params: Filter,@Res() res:any): Promise<Pagination<BookingModel[]>> {
        return await this.bookingService.bookingInfoById(params,res);
    }

    @Authorized(UserRoles.USER)
    @Post('/')
    @ResponseSchema(BookingModel, {
        description: 'add booking by user'
    })
    public async addbooking(@Body() body: BookingReq, @Req() req: BookingReq): Promise<BookingModel> {
        await validateOrReject(body);
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization'])
        body.userId = decodedToken?._id;
        return await this.bookingService.addbooking(body)
    }

    /*  ------------------update booking by admin ---------------  */
    @Authorized(UserRoles.ADMIN)
    @Patch('/')
    @ResponseSchema(BookingModel, {
        description: 'update booking by admin',
    })
    public async updatebooking(@Body() body: BookingRes): Promise<BookingModel | {}> {
        return await this.bookingService.updatebooking(body);
    }


}