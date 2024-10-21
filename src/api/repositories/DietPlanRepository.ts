import { EntityRepository, Repository } from "typeorm";
import { DietPlanModel } from "../models/DietPlanModel";

@EntityRepository(DietPlanModel)
export class DietPlanRepository extends Repository<DietPlanModel> {


}