import { Service } from "typedi";
import { OrmRepository } from "typeorm-typedi-extensions";
import { MealPictureRepository } from "../repositories/MealPictureRepository";
import { MealPictureModel } from "../models/MealPictureModel";
import { MealPictureReq } from "../controllers/requests/MealPicture";
import { Filter } from "../controllers/requests/User";
const ObjectId = require('mongodb').ObjectId;

@Service()
export class MealPictureService {
    constructor(
        @OrmRepository() private mealPictureRepository: MealPictureRepository,
    ) {
    }

    /* ---------------------- get meal data ------------------*/
    public async mealDataUser(userId: string, filter: Filter): Promise<MealPictureModel[]> {
        const result = await this.mealPictureRepository.mealDataUser(ObjectId(userId), filter)
        result.map((ele) => {
            ele._id = ele?._id?.toString();
            ele.userId = ele?.userId?.toString();
            ele.mealImage = JSON.parse(ele?.mealImage);
        })
        return result;
    }

    /* ------------------ add meal picture by user ------------------ */
    public async addMealPicture(body: MealPictureReq): Promise<MealPictureModel> {
        let userId = ObjectId(body?.userId);
        body.userId = userId;
        body.mealImage = JSON.stringify(body?.mealImage)
        const res = await this.mealPictureRepository.save(body);
        res._id = res?._id?.toString()
        res.userId = res?.userId?.toString();
        return res;
    }

}