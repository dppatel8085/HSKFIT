import { HttpError } from "routing-controllers";

export class RecipeNotFound extends HttpError {
    constructor() {
        super(404, 'ERROR.RECIPE_ID_NOT_FOUND ')
    }
}