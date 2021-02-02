import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import { Params } from '@feathersjs/feathers';

export class Collection extends Service {
  app: Application;
  docs: any

  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async find(params: Params): Promise<any> {
    params.query.$or = [
      {
        userId: params.query.userId
      },
      {
        isPublic: true
      }
    ];
    delete params.query.userId;
    return super.find(params);
  }
}
