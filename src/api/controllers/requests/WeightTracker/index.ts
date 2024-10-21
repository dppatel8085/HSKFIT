import { IsOptional } from "class-validator";

export class WeightTrackerReq {

    @IsOptional()
    public weightInKg: number;

    @IsOptional()
    public weightInLb: number;

    @IsOptional()
    public userId: string;

    @IsOptional()
    public headers: any;

}