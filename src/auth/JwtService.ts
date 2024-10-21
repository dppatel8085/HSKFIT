import * as jwt from 'jsonwebtoken';
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { env } from '../env';
import { UsersRepository } from '../api/repositories/UsersRepository';
import { AdminRepository } from '../api/repositories/AdminRepository';
import { InActiveError } from '../api/errors/User';
const ObjectId = require('mongodb').ObjectId;

@Service()
export class JwtService {

    constructor(
        @OrmRepository() private usersRepository: UsersRepository,
        @OrmRepository() private adminRepository: AdminRepository,
    ) {
    }

    public signJwt(user: any): string {
        return jwt.sign(
            { userId: user._id, Role: user.role },
            env.jwt.secret,
            { algorithm: env.jwt.algorithm, expiresIn: env.jwt.expireIN }
        );
    }

    public signRefreshJwt(user: any): any {

        return jwt.sign(
            { userId: user._id, Role: user.role },
            env.jwt.secretRefresh,
            { algorithm: env.jwt.algorithmRefresh, expiresIn: env.jwt.refreshExpireIn }
        );
    }


    public async decode(token: string, secretKey: string): Promise<undefined | any> {
        const decoded: any = jwt.verify(token, secretKey);
        let userId = ObjectId(decoded.userId)
        let userData;
        let user = await this.adminRepository.findOne({
            where: {
                _id: userId,
                role: decoded.Role,
            },
        });
        if (!user) {
            userData = await this.usersRepository.findOne({
                where: {
                    _id: userId,
                    role: decoded.Role,
                },
            });
        }
        // console.log(token,"============",userData?.jwtToken)
        if (user) {
            if (token != user?.jwtToken) throw new InActiveError()
            return user;
        } else if (userData) {
            if (token != userData?.jwtToken) throw new InActiveError()
            return userData;
        }
        return undefined;
    }

    public async getIdByToken(token: string, secretKey: string): Promise<any> {
        const decoded = jwt.verify(token, secretKey)
        if (decoded) {
            return decoded;
        }
        return undefined;
    }
}




