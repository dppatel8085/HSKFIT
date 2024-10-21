import { IsNotEmpty, IsOptional } from "class-validator";

export class BookingReq {

    @IsNotEmpty()
    public date: Date;

    @IsNotEmpty()
    public timeSlot: string;

    @IsOptional()
    public userId: string;

    @IsOptional()
    public headers: any;

    @IsOptional()
    public userType: string;
}