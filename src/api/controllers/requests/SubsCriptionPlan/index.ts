import { IsNotEmpty, IsOptional } from "class-validator";

export class SubsCriptionReq {

    @IsNotEmpty()
    public durationInMonth: number;

    @IsNotEmpty()
    public planName: string;

    @IsNotEmpty()
    public planIncludes: string;

    @IsOptional()
    public status: boolean

}