import { EntityRepository, Repository } from "typeorm";
import { FollowUpMsgModel } from "../models/FollowUpMsgModel";

@EntityRepository(FollowUpMsgModel)
export class FollowUpMsgRepository extends Repository<FollowUpMsgModel> {


}