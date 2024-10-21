import { LoggerInterface } from "../../lib/logger";
import { Service } from "typedi";
import { ConfigurationRepositry } from "../repositories/ConfigurationRepository";
import { OrmRepository } from "typeorm-typedi-extensions";
import { Logger } from "../../decorators/Logger";
import { ConfigurationModel } from "../models/ConfigurationModel";
import { ConfigurationRequest } from "../controllers/requests/Configuration";
import { ConfigurationResponse } from "../controllers/respons/Configuration";
import { ObjectId } from 'mongodb'

@Service()
export class ConfigurationService {

    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private configurationRepositry: ConfigurationRepositry,
    ) { }

    /* ----------------- configuration info  ------------------ */
    public async configurationInfo(): Promise<ConfigurationModel[] |any> {
        this.log.info('get configuration info ');
        const response= await this.configurationRepositry.find();
        let result = response?.map((ele) => ({ ...ele, _id: ele._id.toString() }));
        return result;
    }

    /* ------------------ add configuration by admin ------------------ */
    public async addConfiguration(body: ConfigurationRequest, res): Promise<ConfigurationModel> {
        this.log.info(`add configuration by admin ${body}`);
        const isExistKey = await this.configurationRepositry.findOne({ key: body?.key });
        if (isExistKey)
            return res.status(404).send({ success: false, MESSAGE: 'CONFIGURATION_NAME_ALREADY_EXIST' })
        return await this.configurationRepositry.save(body);
    }

    /*  ------------------update configuration by admin ---------------  */
    public async updateConfiguration(updateBody: ConfigurationResponse, res: ConfigurationResponse): Promise<ConfigurationModel | {}> {
        this.log.info(`Update Configuration by admin ${updateBody}`);
        const id = new ObjectId(updateBody._id);
        updateBody.id = id;
        const isConfigurationExist = await this.configurationRepositry.findOne(updateBody?.id);
        if (isConfigurationExist) {
            isConfigurationExist.key = updateBody?.key;
            isConfigurationExist.value = updateBody?.value;
            await this.configurationRepositry.save(isConfigurationExist);
            return await this.configurationRepositry.findOne(updateBody?.id);
        }
        return res.status(404).send({ success: false, MESSAGE: 'CONFIGURATION_ID_NOT_FOUND' })
    }

}