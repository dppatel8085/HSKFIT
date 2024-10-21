import { IsNotEmpty, IsOptional } from "class-validator";

export class DietPlanReq {

    @IsNotEmpty()
    public days: string;

    @IsOptional()
    public include: string;

    @IsOptional()
    public exclude: string;

    @IsNotEmpty()
    public dietitianId: number;

    @IsOptional()
    public headers: any;

}