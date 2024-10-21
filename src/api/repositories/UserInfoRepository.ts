import { EntityRepository, Repository } from "typeorm";
import { UserInfoModel } from "../models/UserInfoModel";

@EntityRepository(UserInfoModel)
export class UserInfoRepository extends Repository<UserInfoModel> {
    
}