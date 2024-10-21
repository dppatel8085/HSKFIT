import { EntityRepository, Repository } from "typeorm";
import { QuestionModel } from "../models/QuestionModel";

@EntityRepository(QuestionModel)
export class QuestionRepository extends Repository<QuestionModel> {

}