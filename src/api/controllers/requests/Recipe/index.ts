import { IsNotEmpty, IsOptional } from "class-validator";

export class RecipeReq {

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

}