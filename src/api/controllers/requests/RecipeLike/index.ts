import { IsNotEmpty, IsOptional } from "class-validator";

export class RecipeRequest {

    @IsNotEmpty()
    public recipeId: number;

    @IsNotEmpty()
    public isRecipe: boolean;

    @IsOptional()
    public userId: string;

}