import { IsNotEmpty, IsOptional } from "class-validator";

export class BookingRes {

    @IsNotEmpty()
    public _id: string;

    @IsNotEmpty()
    public date: Date;

    @IsNotEmpty()
    public timeSlot: string;

    @IsOptional()
    public userId: number;

    @IsOptional()
    public headers: any;

    @IsOptional()
    public userType: string;

    @IsOptional()
    public status: string;

    @IsOptional()
    public addDate: Date;

    @IsOptional()
    public dietPlanStatus: string;
}