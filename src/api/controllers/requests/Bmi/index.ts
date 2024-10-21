import { IsNotEmpty, IsOptional } from "class-validator";

export class BmiReq {

    @IsNotEmpty()
    public height: string;

    @IsNotEmpty()
    public weight: string;

    @IsOptional()
    public age: number;

    @IsOptional()
    public result: string;

    @IsOptional()
    public userId: number;

    @IsOptional()
    public headers: any;

}