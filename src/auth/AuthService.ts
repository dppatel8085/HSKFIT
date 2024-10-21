import { classToPlain } from 'class-transformer';
import * as express from 'express';
import { LoginError, OtpNotFound, RefreshTokenError } from '../api/errors/User';
import { Service } from 'typedi';
import { JwtService } from './JwtService';
import { Logger, LoggerInterface } from '../decorators/Logger';
import { env } from '../env';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { AdminRepository } from '../api/repositories/AdminRepository';
import { AdminModel } from '../api/models/AdminModel';
import { UsersRepository } from '../api/repositories/UsersRepository';
import { UserRoles } from '../api/enums/Users';
import { UserInfoRepository } from '../api/repositories/UserInfoRepository';
import { OtpRepository } from '../api/repositories/OtpRepository';
import { BookingRepository } from '../api/repositories/BookingRepository';


@Service()
export class AuthService {

    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @Service() private jwtService: JwtService,
        @OrmRepository() private adminRepository: AdminRepository,
        @OrmRepository() private usersRepository: UsersRepository,
        @OrmRepository() private userInfoRepository: UserInfoRepository,
        @OrmRepository() private otpRepository: OtpRepository,
        @OrmRepository() private bookingRepository: BookingRepository
    ) {
    }

    public async parseAuthFromRequest(req: express.Request): Promise<undefined> {
        const authorization = req.header('Authorization');
        if (authorization && authorization.split(' ')[0] === 'Bearer') {
            const decoded = await this.jwtService.decode(authorization.split(' ')[1], env.jwt.secret);
            this.log.info('Credentials provided by the client', decoded, authorization);
            return decoded;
        }
        if (req.query && req.query.authToken && typeof req.query.authToken === 'string') {
            const decoded = await this.jwtService.decode(req.query.authToken, env.jwt.secret);
            this.log.info('Credentials provided by the client in params', decoded, authorization);
            return decoded;
        }
        this.log.info('No credentials provided by the client', authorization);
        return undefined;
    }

    public async login(username: string, password: string, res: any): Promise<any> {
        username = username.toLowerCase();
        const dbUser = await this.adminRepository.findOne({ email: username });
        if (dbUser) {
            if (!dbUser?.status) throw new LoginError()
            const isCorrectPassword = await AdminModel.comparePassword(dbUser, password);
            if (isCorrectPassword) {
                const token = this.jwtService.signJwt(dbUser);
                const refreshToken = this.jwtService.signRefreshJwt(dbUser);
                dbUser.jwtToken = token;
                await this.adminRepository.save(dbUser);
                let res = await this.adminRepository.findOne(dbUser._id);
                res._id = (res._id).toString();
                return {
                    ...classToPlain(res),
                    token,
                    refreshToken,
                    message: 'MESSAGES.USER.LOGIN_SUCCESS',
                };
            }
        }
        return {
            is_error: true,
        };
    }

    public async verifyUser(mobileNumber: string, deviceType: any, deviceToken: string, otp: string, res: any): Promise<any> {

        const isVerifyOtp: any = await this.otpRepository.findOne({ mobileNumber: mobileNumber, otp: otp })
        if (!isVerifyOtp)
            throw new OtpNotFound();
        await this.otpRepository.delete(isVerifyOtp?._id)
        let height, weight, isFeet, isKg;
        let user: any = await this.usersRepository.findOne({ mobileNumber: mobileNumber });
        if (!user) {
            const isSave: any = {
                role: 2,
                gender: null,
                age: null,
                address: null,
                profilePic: null,
                isCompleted: false,
                isCompletedStep: 0,
                isStep1: false,
                isSkip: false,
                isActive: true,
                mobileNumber: mobileNumber, deviceType: deviceType, deviceToken: deviceToken
            }
            user = await this.usersRepository.save(isSave);
            // user = await this.usersRepository.getUserData(user?.id);
            user['role'] = UserRoles.USER
            const message = 'MESSAGES.SUCCESSFULLY_CREATE_USER';
            weight = null;
            height = null;
            isFeet = true;
            isKg = true;
            return this.generateResponse(user, message, height, weight, isFeet, isKg);
        }
        // if (!user?.isActive) throw new LoginError()
        user.deviceToken = deviceToken;
        user.deviceType = deviceType;
        await this.usersRepository.save(user);
        // user = await this.usersRepository.getUserData(user?.id);
        const userInfo = await this.userInfoRepository.findOne({ userId: user?.id })
        if (userInfo) {
            height = userInfo?.height;
            weight = userInfo?.weight;
            isFeet = userInfo?.isFeet;
            isKg = userInfo?.isKg
        } else {
            height = null;
            weight = null;
            isFeet = true;
            isKg = true
        }
        const message = 'MESSAGES.USER.LOGIN_SUCCESS';
        return this.generateResponse(user, message, height, weight, isFeet, isKg);
    }

    private async generateResponse(user: any, message: string, height: any, weight: any, isFeet, isKg) {
        const isBooking = await this.bookingRepository.isBooking(user?._id);
        const token = this.jwtService.signJwt(user);
        const updateJwtToken = await this.usersRepository.findOne(user?._id);
        updateJwtToken.jwtToken = token;
        await this.usersRepository.save(updateJwtToken)

        const refreshToken = this.jwtService.signRefreshJwt(user);
        user.dietitianId = user?.dietitianId ? user?.dietitianId?.toString() : null;
        user._id = user?._id?.toString();
        return {
            ...classToPlain(user),
            token,
            refreshToken,
            message,
            height,
            weight,
            isFeet, isKg,
            isBooking
        };
    }

    public async checkRefresh(refreshToken: string): Promise<any> {
        const user = await this.jwtService.decode(refreshToken, env.jwt.secretRefresh);

        if (!user) {
            throw new RefreshTokenError();
        } else {
            return {
                token: this.jwtService.signJwt(user),
                refreshToken: this.jwtService.signRefreshJwt(user),
            };
        }
    }

}
