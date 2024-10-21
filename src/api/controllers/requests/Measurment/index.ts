import { IsNotEmpty, IsOptional } from "class-validator";

export class MeasurmentReqest {

    @IsNotEmpty()
    public chest: string

    @IsNotEmpty()
    public arm: string

    @IsNotEmpty()
    public waist: string

    @IsNotEmpty()
    public hips: string

    @IsNotEmpty()
    public thigh: string

    @IsOptional()
    public userId: string

    @IsOptional()
    public headers: any
}