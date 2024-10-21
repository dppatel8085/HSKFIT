import { IsNotEmpty, IsOptional } from "class-validator";
import { ObjectID } from "typeorm";

export class FollowUpReq {

    @IsNotEmpty()
    public userId: ObjectID;

    @IsNotEmpty()
    public freeText: string;

    @IsOptional()
    public dietitianId: ObjectID;

    @IsOptional()
    public headers: any;

}