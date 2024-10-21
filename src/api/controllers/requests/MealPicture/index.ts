import { IsNotEmpty, IsOptional } from "class-validator";

export class MealPictureReq {

    @IsNotEmpty()
    public mealImage: string;

    @IsOptional()
    public userId: string;

    @IsOptional()
    public _id: string;

    @IsOptional()
    public headers: any;

}