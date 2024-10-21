import {
    IsEmail, IsNotEmpty, IsOptional, IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class LoginRequest {
    @IsEmail()
    @IsNotEmpty()
    public username: string;

    @IsNotEmpty()
    public password: string;

    @IsOptional()
    public mobileNumber: string;

    @IsOptional()
    public deviceType: string;

    @IsOptional()
    public deviceToken: string;

}

export class MobileRequest {

    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(13)
    public mobileNumber: string;

    @IsOptional()
    public deviceType: string;

    @IsOptional()
    public otp: string;

    @IsOptional()
    public deviceToken: string;

}

export class RefreshTokenRequest {
    @IsEmail()
    @IsString()
    public refreshToken: string;
}

export class Filter {

    @IsOptional()
    public q: string;

    @IsOptional()
    public type: string;

    @IsOptional()
    public sortField: string;

    @IsOptional()
    public sortValue: any;

    @IsOptional()
    public page: number;

    @IsOptional()
    public limit: number;

    @IsOptional()
    public isActive: any;

    @IsOptional()
    public startDate: Date;

    @IsOptional()
    public endDate: Date;

    @IsOptional()
    public planName: string;

    @IsOptional()
    public gender: string;

    @IsOptional()
    public Quarterly: string;

    @IsOptional()
    public Yearly: string;

    @IsOptional()
    public startDuration: any;

    @IsOptional()
    public endDuration: any;

    @IsOptional()
    public userType: string;

    @IsOptional()
    public status: any;

    @IsOptional()
    public age: string;

    @IsOptional()
    public weight: string;

    @IsOptional()
    public height: string;

    @IsOptional()
    public deviceType: string;
}

export class ForgetRequest {

    @IsNotEmpty()
    public email: string;
}

export class CompleteProfileRequest {

    @IsOptional()
    public _id: string;

    @IsOptional()
    public name: string;

    @IsOptional()
    public role: number;

    @IsOptional()
    public gender: string;

    @IsOptional()
    public age: number;

    @IsOptional()
    public address: string;

    @IsOptional()
    public mobileNumber: string;

    @IsOptional()
    public isCompleted: boolean;

    @IsOptional()
    public profilePic: string;

    @IsOptional()
    public isStep1: string;

    @IsOptional()
    public isStep2: boolean;

    @IsOptional()
    public isStep3: string;

    @IsOptional()
    public isStep4: boolean;

    @IsOptional()
    public isStep5: string;

    @IsOptional()
    public isStep6: boolean;

    @IsOptional()
    public isStep7: string;

    @IsOptional()
    public isStep8: boolean;

    @IsOptional()
    public isStep9: string;

    @IsOptional()
    public isStep10: boolean;

    @IsOptional()
    public isActive: boolean;

    @IsOptional()
    public deviceToken: string;

    @IsOptional()
    public isSkip: boolean;

    @IsOptional()
    public deviceType: any;

    @IsOptional()
    public isFeet: any;

    @IsOptional()
    public isKg: any;

    @IsOptional()
    public headers: string;

    @IsOptional()
    public healthAssesementScore: number;

    @IsOptional()
    public isCompletedStep: number;

    @IsOptional()
    public height: string;

    @IsOptional()
    public weight: string;


}

export class updatePasswordRequest {

    @IsNotEmpty()
    public id: number;

    @IsNotEmpty()
    public oldPassword: string;

    @IsNotEmpty()
    public newPassword: string;
}






