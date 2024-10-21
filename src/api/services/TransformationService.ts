import { Service } from "typedi";
import { TransformationRepository } from "../repositories/TransformationRepository";
import { OrmRepository } from "typeorm-typedi-extensions";
import { Logger, LoggerInterface } from "../../decorators/Logger";
import { TransformationModel } from "../models/TransformationModel";
import { TransformationNotFound } from "../errors/Transformation";
import { Pagination } from "nestjs-typeorm-paginate";
import { TransformationReq } from "../controllers/requests/Transformation";
import { TransformationRes } from "../controllers/respons/Transformation";
import { Filter } from "../controllers/requests/User";
import { Role } from "../enums/Users";
import { ObjectId } from 'mongodb'

@Service()
export class TransformationService {
    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private transformationRepository: TransformationRepository,
    ) {
    }

    /* ------------------ add transformation by admin ------------------ */
    public async addTransformation(body: TransformationReq): Promise<TransformationModel> {
        body.isActive = true;
        return await this.transformationRepository.save(body);
    }

    /* ----------------------- delete transformation by admin --------------- */
    public async deleteTransformation(id: string, res: any): Promise<TransformationModel> {
        this.log.info(`delete transformation ${id}`)
        const _id = new ObjectId(id);
        await this.getTransformationData(_id);
        await this.transformationRepository.delete(_id);
        return res.status(200).send({ success: true, MESSAGE: 'SUCCESSFULLY_DELETE' })
    }

    /* -------------------------- get transformation data by id ----------------- */
    public async getTransformationData(id: any): Promise<TransformationModel | any> {
        this.log.info(`get transformation data by ${id}`)
        const transformationData = await this.transformationRepository.findOne({ _id: id });
        if (transformationData) return transformationData;
        throw new TransformationNotFound()
    }

    /* --------------------- edit transformation by admin ---------------------- */
    public async editTransformation(body: TransformationRes): Promise<TransformationModel> {
        const id = new ObjectId(body?._id);
        body.id = id;
        const transformationData = await this.getTransformationData(body?.id);
        transformationData.title = body?.title;
        transformationData.shortDesc = body?.shortDesc;
        transformationData.longDesc = body?.longDesc;
        transformationData.image = body?.image;
        transformationData.externalLink = body?.externalLink;
        if (body?.isActive)
            transformationData.isActive = (body?.isActive == 'true') ? true : false;
        await this.transformationRepository.save(transformationData);
        return await this.getTransformationData(body?.id);
    }

    /* ---------------- get transformation list by admin and user ---------- */
    public async transformationList(parmas: Filter, roleId: number, userid: string): Promise<Pagination<TransformationModel[]>> {
        this.log.info(`get transformation list by admin and user`)
        let res;
        if (Role.ADMIN == roleId)
            res = await this.transformationRepository.transformationList(parmas, roleId);
        else {
            const userId = new ObjectId(userid);
            res = await this.transformationRepository.transformationListByUser(parmas, roleId, userId);
        }
        (res?.items)?.map((ele) => {
            ele._id = ele?._id?.toString();
            ele['isLike'] = ele?.isRecipeLike?.length ? true : null;
        })
        return res;
    }


    /* ---------------- get transformation data without pagination in home appi ---------- */
    public async getTransformationDataHome(parmas: any, roleId: number, userId: number): Promise<TransformationModel[] | any> {
        this.log.info(`get transformation data`)
        return await this.transformationRepository.getTransformationData(parmas, roleId, userId)
    }

    /* ---------------- get transformation data by id  ---------- */
    public async transformationById(transformationid: string, userid: string): Promise<TransformationModel> {
        this.log.info(`get transformation data by id `)
        const userId = new ObjectId(userid);
        const transformationId = new ObjectId(transformationid);
        let res = await this.transformationRepository.transformationById(transformationId, userId);
        if (res) {
            res._id = res?._id?.toString();
            res['isLike'] = res?.isRecipeLike?.length ? true : null;
        }
        return res;
    }


}
