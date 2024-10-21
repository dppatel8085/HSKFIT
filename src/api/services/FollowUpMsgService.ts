import { Service } from "typedi";
import { FollowUpMsgRepository } from "../repositories/FollowUpMsgRepository";
import { OrmRepository } from "typeorm-typedi-extensions";
import { FollowUpMsgModel } from "../models/FollowUpMsgModel";
import { Logger } from "../../decorators/Logger";
import { LoggerInterface } from "../../lib/logger";
import { ObjectId } from 'mongodb'

@Service()
export class FollowUpMsgService {

    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private followUpMsgRepository: FollowUpMsgRepository
    ) { }

    /*---------------------- add follow up msg -------------- */
    public async addFollowUpMsg(body: any): Promise<FollowUpMsgModel> {
        let userid = new ObjectId(body?.userId)
        body.userId = userid;
        this.log.info(` add follow up msg ${body}`)
        const response = await this.followUpMsgRepository.save(body);
        response._id = response?._id?.toString();
        response.userId = response?.userId?.toString();
        response.dietitianId = response?.dietitianId?.toString()
        return response;

    }





}