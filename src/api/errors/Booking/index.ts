

import { HttpError } from "routing-controllers";

export class BookingNotFound extends HttpError {
    constructor() {
        super(404, 'ERROR.BOOKING_ID_NOT_FOUND ')
    }
}

export class BookingAlreadyExist extends HttpError {
    constructor() {
        super(406, 'ERROR.BOOKING_ALREADY_EXIST ')
    }
}


export class BookingError extends HttpError{
    constructor(){
        super(404,'ERROR.NOT_A_ACTIVE_PLAN')
    }
}