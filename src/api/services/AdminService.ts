import { Logger, LoggerInterface } from "../../decorators/Logger";
import { Service } from "typedi";
import { AdminRepository } from "../repositories/AdminRepository";
import { OrmRepository } from "typeorm-typedi-extensions";
import { AdminModel } from "../models/AdminModel";
import { env } from '../../env'
import { EmailError, EmailExistError, MobileAlreadyExist, UserNotFound } from "../errors/User";
import { AdminMail } from "../../mailers/useMailer";
import { Pagination } from "nestjs-typeorm-paginate";
import { Filter } from "../controllers/requests/User";
import { UsersRepository } from "../repositories/UsersRepository";
import { UserRoles } from "../enums/Users";
const ObjectId = require('mongodb').ObjectId;


@Service()
export class AdminService {
    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private adminRepository: AdminRepository,
        @OrmRepository() private usersRepository: UsersRepository
    ) {
    }

    public async getAdminData(id: string): Promise<AdminModel> {
        this.log.info(`get admin information by id`, id);
        return await this.adminRepository.findOne({ _id: id });
    }

    public async updatePasswordByAdmin(body: any, res: any): Promise<AdminModel> {
        this.log.info(`update password by admin`, body);
        const userData = await this.adminRepository.findOne({ _id: ObjectId(body?._id) })
        const isPassword = await AdminModel.comparePassword(userData, body['oldPassword'])
        if (!isPassword)
            return res.status(404).send({ success: false, MESSAGE: 'ERROR_PASSWORD_MISS_MATCH' })
        const isEqualOldPassword = await AdminModel.comparePassword(userData, body['newPassword'])
        if (isEqualOldPassword)
            return res.status(404).send({ success: false, MESSAGE: 'ERROR.OLD_AND_NEW_PASSWORD_SAME' })
        const hashPassword = await AdminModel.hashPassword(body['newPassword']);
        userData.password = hashPassword;
        await this.adminRepository.save(userData);
        return res.status(200).send({ success: true, MESSAGE: 'PASSWORD_UPDATED_SUCCESSFULLY' })
    }

    public async forgetPassword(email: string, res: any): Promise<AdminModel> {
        const dbUser = await this.adminRepository.findOne({ email: email });
        if (dbUser) {
            const digits = env.digits;
            let password = '';
            const passwordLength = 8;
            for (let i = 0; i < passwordLength; i++) {
                password += digits.charAt(Math.floor(Math.random() * digits.length));
            }
            const newPassword = await AdminModel.hashPassword(password);
            dbUser.password = newPassword;
            await AdminMail(dbUser?.email, password);
            await this.adminRepository.save(dbUser);
            return res.status(200).send({ success: true, MESSAGE: 'EMAIL_SENT_SUCCESSFULLY' })
        }
        throw new EmailError()
    }

    /* ---------------------------- add dietitian by admin -------------------*/
    public async addDietitianByAdmin(body: any): Promise<AdminModel> {

        const isMobileExist = await this.adminRepository.isMobileExist(body?.mobileNumber)
        const userMobileExist = await this.usersRepository.findOne({ mobileNumber: body?.mobileNumber })
        if (!isMobileExist && !userMobileExist) {
            body.email = (body.email)?.toLowerCase();
            const isEmailExist = await this.adminRepository.findOne({ email: body?.email });
            if (!isEmailExist) {
                const hashpassword = await AdminModel.hashPassword(body?.password);
                body.password = hashpassword;
                body.createdById = ObjectId(body?.createdById)
                body.role = UserRoles.DIETITIAN;
                body.status = true;
                const response = await this.adminRepository.save(body);
                response._id = response?._id?.toString();
                response.createdById = response?.createdById?.toString();
                return response;
            }
            throw new EmailExistError()
        }
        throw new MobileAlreadyExist();
    }

    /* ----------------------------------- get dietitan list by admin ---------- */
    public async dietitianList(params: Filter): Promise<Pagination<AdminModel[]>> {
        this.log.info(`get dietitan list by admin`)
        return await this.adminRepository.getDietitianList(params)
    }

    /* ----------------------------------- get dietitans  ---------- */
    public async getDietitans(): Promise<AdminModel[]> {
        this.log.info(`get dietitans by admin`)
        return await this.adminRepository.getDietitans()
    }

    /* -------------------- update dietian by admin ------------ */
    public async updateDietianByAdmin(body: any, res: any): Promise<AdminModel> {
        this.log.info(`update dietitan by admin`);

        const dietitanData: any = await this.getAdminData(ObjectId(body?._id));
        if (dietitanData) {
            dietitanData.mobileNumber = body?.mobileNumber;
            dietitanData.address = body?.address;
            dietitanData.name = body?.name;
            dietitanData.status = body?.status;
            if (body?.status == false)
                dietitanData.jwtToken = null;
            if (body?.password)
                dietitanData.password = await AdminModel.hashPassword(body?.password)
            await this.adminRepository.save(dietitanData);
            return await this.getAdminData(ObjectId(body?._id));
        }
        throw new UserNotFound()
    }

    /* ----------------------- delete dietian by admin --------------- */
    public async deleteDietitian(id: string, res: any): Promise<AdminModel> {
        this.log.info(`delete dietian by admin ${id}`)
        const isDietitanExist = await this.getAdminData(ObjectId(id));
        if (isDietitanExist) {
            await this.adminRepository.delete(ObjectId(id));
            return res.status(200).send({ success: true, MESSAGE: 'SUCCESSFULLY_DELETE' })
        }
        throw new UserNotFound();
    }

    /* -------------------- user of dietitan by admin and dietitan ---------- */
    public async userOfDietitian(id: string): Promise<AdminModel> {
        this.log.info(`user of dietitian by admin and dietitan , ${id}`)
        return await this.adminRepository.userOfDietitian(ObjectId(id));
    }

}