import { IsNotEmpty, IsOptional } from "class-validator";

export class TransformationRes {

    @IsNotEmpty()
    public id: number

    @IsNotEmpty()
    public _id: string

    @IsNotEmpty()
    public title: string;

    @IsNotEmpty()
    public shortDesc: string;

    @IsNotEmpty()
    public longDesc: string;

    @IsOptional()
    public externalLink: string;

    @IsNotEmpty()
    public image: string;

    @IsOptional()
    public isActive: any;

    @IsOptional()
    public headers: any;

}