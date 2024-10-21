import {HttpError} from 'routing-controllers';

export class RefreshTokenError extends HttpError {
    constructor() {
        super(401, 'TOKEN.ERRORS.REFRESH_TOKEN_IS_NOT_CORRECT');
    }
}

export class EmailError extends HttpError {
    constructor() {
        super(404, 'ERROR.EMAIL_NOT_FOUND ')
    }
}


export class MobileAlreadyExist extends HttpError {
    constructor() {
        super(406, 'ERROR.MOBILE_NUMBER_ALREADY_EXIST ')
    }
}

export class EmailExistError extends HttpError {
    constructor(){
        super(406,'ERROR.EMAIL_ALREADY_EXIST')
    }
}

export class UserNotFound extends HttpError {
     constructor(){
        super(404,'ERROR.USER_NOT_FOUND')
     }
}

export class OtpNotFound extends HttpError {
    constructor(){
       super(404,'ERROR.OTP_NOT_EXIST')
    }
}

export class ExcelError extends HttpError {
    constructor() {
        super(406, 'ERROR.EXCEL_CAN_NOT_EMPTY')
    }
}

export class LoginError extends HttpError {
    constructor(){
        super(406, 'ERROR.CAN_NOT_LOGIN')
    }
}

export class InActiveError extends HttpError {
    constructor(){
       super(403,'ERROR.USER_INACTIVE')
    }
}

