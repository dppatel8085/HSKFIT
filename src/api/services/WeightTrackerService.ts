import { Logger, LoggerInterface } from "../../decorators/Logger";
import { Service } from "typedi";
import { OrmRepository } from "typeorm-typedi-extensions";
import { WeightTrackerRepository } from "../repositories/WeightTrackerRepository";
import { WeightTrackerModel } from "../models/WeightTrackerModel";
import { WeightTrackerReq } from "../controllers/requests/WeightTracker";
import { Filter } from "../controllers/requests/User";
import { ObjectId } from 'mongodb'

@Service()
export class WeightTrackerService {
  constructor(
    @Logger(__filename) private log: LoggerInterface,
    @OrmRepository() private weightTrackerRepository: WeightTrackerRepository,
  ) { }

  /* ------------------ add weight tracker by user------------------ */
  public async addWeigthTracker(body: WeightTrackerReq): Promise<WeightTrackerModel> {
    this.log.info(`add weight tracker by user ${body}`)
    const userId = new ObjectId(body?.userId);
    body.userId = userId;
    const lastEntryWeightTracker = await this.weightTrackerRepository.lastEntryWeightTracker(body?.userId);
    if (lastEntryWeightTracker) {
      let date = new Date();
      let currentMonth = date.getMonth();
      let cuurentYear = date.getFullYear();
      const newDate = [currentMonth, cuurentYear].join("-")
      let getMonth = lastEntryWeightTracker?.createdAt.getMonth();
      let getFullYear = lastEntryWeightTracker?.createdAt.getFullYear();
      const recieveDate = [getMonth, getFullYear].join("-");
      if (newDate == recieveDate) {
        lastEntryWeightTracker.weightInKg = body?.weightInKg ? Number(body?.weightInKg) : Number(body?.weightInLb);
        const res = await this.weightTrackerRepository.save(lastEntryWeightTracker);
        res._id = res?._id?.toString();
        res.userId = res?.userId?.toString()
        return res;
      }
    }
    if (body?.weightInLb)
      body.weightInKg = body?.weightInLb
    const result = await this.weightTrackerRepository.save({ weightInKg: Number(body.weightInKg), userId: body?.userId });
    result._id = result?._id?.toString();
    result.userId = result?.userId?.toString()
    return result;
  }

  /* ------------------------ get weight ------------------ */
  public async getWeight(param: Filter, userid: string): Promise<WeightTrackerModel> {
    const userId = new ObjectId(userid);
    return await this.weightTrackerRepository.getWeight(param, userId);
  }


}