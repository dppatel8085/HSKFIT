import { IsNotEmpty } from "class-validator";

export class ConfigurationRequest {

    @IsNotEmpty()
    public key: string;

    @IsNotEmpty()
    public value: string;

}