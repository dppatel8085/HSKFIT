import  {IsNotEmpty, IsOptional} from 'class-validator';


export class BaseUser {
    @IsNotEmpty()
    public email: string;



    @IsNotEmpty()
    public createdAt: Date;

    @IsNotEmpty()
    public updatedAt: Date;

}
export class UserResponse extends BaseUser {
    public id: number;
}


export class UsersResponse {
    @IsOptional()
    public id: number;

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
    public headers: string;

}


