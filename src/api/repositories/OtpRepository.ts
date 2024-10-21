import { EntityRepository, Repository } from "typeorm";
import { OtpModel } from "../models/OtpModel";
import { getMongoRepository } from "typeorm";


@EntityRepository(OtpModel)
export class OtpRepository extends Repository<OtpModel> {
    private otpRepos = getMongoRepository(OtpModel);

    public async expireOtp(): Promise<OtpModel | void> {
        //     const currentDate = new Date();
        //     const pastDate = new Date(currentDate.getTime() - 5 * 60000);
        //     await this
        //         .createQueryBuilder('otp')
        //         .delete()
        //         .from('otp')
        //         .andWhere('otp.created_at < :pastDate', { pastDate })
        //         .execute();
        // }
        const currentDate = new Date();
        const pastDate = new Date(currentDate.getTime() - 5 * 60000);
        const query = {
            createdAt: { $lt: pastDate }
        };

        await this.otpRepos.deleteMany(query);
    }
}