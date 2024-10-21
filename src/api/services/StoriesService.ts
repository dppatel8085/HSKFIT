import { Logger, LoggerInterface } from "../../decorators/Logger";
import { Service } from "typedi";
import { OrmRepository } from "typeorm-typedi-extensions";
import { StoriesRepository } from "../repositories/StoriesRepository";
import { StoriesModel } from "../models/StoriesModel";
import { StoryIdNotFound } from "../errors/Story";
import { Pagination } from "nestjs-typeorm-paginate";
// import { StoriesReq } from "../controllers/requests/Stories";
import { StoriesRes } from "../controllers/respons/Stories";
import { Filter } from "../controllers/requests/User";
import { ObjectId } from 'mongodb'

@Service()
export class StoriesService {

    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private storiesRepository: StoriesRepository,
    ) {
    }

    /* ------------------- add story by admin ---------------- */
    public async addStory(body: any): Promise<StoriesModel> {
        body.isActive=true
        return await this.storiesRepository.save(body);
    }

    /* ------------------- delete story by admin -------------- */
    public async deleteStoryByAdmin(id: string, res: any): Promise<StoriesModel | any> {
        this.log.info(`delete story by admin ${id}`);
        const _id = new ObjectId(id);
        await this.getStoryData(_id);
        await this.storiesRepository.delete(_id);
        return res.status(200).send({ success: true, MESSAGE: 'SUCCESSFULLY_DELETE' })
    }

    /* -------------------- get story data by is -------------- */
    public async getStoryData(id: any): Promise<StoriesModel> {
        const isStoryData = await this.storiesRepository.findOne({ _id: id });
        if (isStoryData) return isStoryData;
        throw new StoryIdNotFound();
    }

    /* -------------------------- update story by admin ------------------ */
    public async updateStory(body: StoriesRes): Promise<StoriesModel> {
        const id = new ObjectId(body?._id);
        body.id = id;
        const storyData = await this.getStoryData(body?.id);
        storyData.storiesTitle = body?.storiesTitle;
        storyData.externalLink = body?.externalLink;
        if (body?.isActive)
            storyData.isActive = (body?.isActive == 'true') ? true : false;
        storyData.storyEndDate = body?.storyEndDate;
        storyData.storiesImage = body?.storiesImage;
        storyData.storyViewImg = body?.storyViewImg;
        await this.storiesRepository.save(storyData);
        return await this.getStoryData(body?.id);
    }


    public async storiesList(params: any, roleId: number): Promise<StoriesModel[]> {
        this.log.info(`subscriptiion plan for admin and user `)
        const res = await this.storiesRepository.storiesList(params, roleId);
        res?.map((ele) => { ele._id = ele?._id?.toString() })
        return res;
    }

    public async storiesListByAdmin(params: Filter, roleId: number): Promise<Pagination<StoriesModel[]>> {
        this.log.info(`subscriptiion plan for admin and user `)
        return await this.storiesRepository.storiesListByAdmin(params, roleId);
    }

    public async updateStories(): Promise<StoriesModel | void> {
        await this.storiesRepository.updateStory()
    }


}