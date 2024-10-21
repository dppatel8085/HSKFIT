import { IsNotEmpty } from "class-validator";

export class SubsCriptionRes {

    @IsNotEmpty()
    public id: number;

    @IsNotEmpty()
    public _id: string

    @IsNotEmpty()
    public durationInMonth: number;

    @IsNotEmpty()
    public planName: string;

    @IsNotEmpty()
    public planIncludes: string;

    @IsNotEmpty()
    public status: boolean;

}