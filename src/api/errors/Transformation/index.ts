import { HttpError } from "routing-controllers";

export class TransformationNotFound extends HttpError {
    constructor(){
        super(404, 'ERROR.TRANSFORMATION_ID_NOT_FOUND ')
    }
}