import { IsNotEmpty, IsOptional } from "class-validator";

export class ConfigurationResponse {

    @IsNotEmpty()
    public id: number

    @IsNotEmpty()
    public _id: string

    @IsNotEmpty()
    public key: string;

    @IsNotEmpty()
    public value: string;

    @IsOptional()
    public status: any;

}