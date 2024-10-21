import { IsNotEmpty, IsOptional } from "class-validator";

export class TransformationReq {

    @IsNotEmpty()
    public title: string;

    @IsNotEmpty()
    public shortDesc: string;

    @IsNotEmpty()
    public longDesc: string;

    @IsNotEmpty()
    public image: string;

    @IsOptional()
    public headers: any;

    @IsOptional()
    public isActive: true;

}