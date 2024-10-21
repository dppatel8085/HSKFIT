import { IsNotEmpty, IsOptional } from "class-validator";

export class RecipeRes {

    @IsNotEmpty()
    public _id: object;

    @IsNotEmpty()
    public id: number;

    @IsNotEmpty()
    public recipeTitle: string;

    @IsNotEmpty()
    public makingDuration: number;

    @IsNotEmpty()
    public cookingDirection: string;

    @IsNotEmpty()
    public recipeImage: string;

    @IsNotEmpty()
    public indredient: string;

    @IsOptional()
    public headers: any;

    @IsOptional()
    public isActive: any;

}