import { IsNotEmpty, IsOptional } from "class-validator";

export class WaterTrackerReq {

    @IsNotEmpty()
    public waterInGlass: string;

    @IsOptional()
    public result: string;

    @IsOptional()
    public userId: string;

    @IsOptional()
    public headers: any;
}