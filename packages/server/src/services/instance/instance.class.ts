import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import {Params} from "@feathersjs/feathers";
import {extractLoggedInUserFromParams} from "../auth-management/auth-management.utils";

export class Instance extends Service {
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }

  async find (params: Params): Promise<any> {
    const action = params.query?.action;
    if (action === 'admin') {
      const loggedInUser = extractLoggedInUserFromParams(params);
      const user = await super.get(loggedInUser.userId);
      return super.find({
        query: {
          $sort: params.query.$sort,
          $skip: params.query.$skip || 0,
          $limit: params.query.$limit || 10
        }
      });
    } else {
      return super.find(params);
    }
  };
}
