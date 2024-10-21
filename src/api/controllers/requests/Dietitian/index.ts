import { IsNotEmpty, IsOptional } from "class-validator";

export class DietitanReq {

    @IsNotEmpty()
    public name: string;

    @IsNotEmpty()
    public email: string;

    @IsNotEmpty()
    public mobileNumber: string;

    @IsNotEmpty()
    public password: string;

    @IsOptional()
    public createdById: number

}