import { EntityRepository, Repository } from "typeorm";
import { ConfigurationModel } from "../models/ConfigurationModel";

@EntityRepository(ConfigurationModel)
export class ConfigurationRepositry extends Repository<ConfigurationModel>{}