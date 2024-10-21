import { HttpError } from "routing-controllers";

export class SubsCriptionError extends HttpError {
    constructor() {
        super(406, 'ERROR.SUBSCRIPTION_PLAN_NAME_ALREADY_EXIST ')
    }
}

export class SubsCriptionPlanNotFound extends HttpError {
    constructor() {
        super(406, 'ERROR.SUBSCRIPTION_PLAN_ID_NOT_FOUND ')
    }
}