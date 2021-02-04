import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import {Params} from "@feathersjs/feathers";
import {extractLoggedInUserFromParams} from "../auth-management/auth-management.utils";
import { Forbidden } from "@feathersjs/errors";

export class Instance extends Service {
  docs: any
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }

  async find (params: Params): Promise<any> {
    const action = params.query?.action;
    if (action === 'admin') {
      const loggedInUser = extractLoggedInUserFromParams(params);
      const user = await super.get(loggedInUser.userId);
      if (user.userRole !== 'admin') throw new Forbidden ('Must be system admin to execute this action');
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
