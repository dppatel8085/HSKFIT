import { HttpError } from "routing-controllers";

export class UserActivePlanError extends HttpError{
    constructor() {
        super(406, 'ERROR.PLAN_ALREADY_EXIST')
    }
}