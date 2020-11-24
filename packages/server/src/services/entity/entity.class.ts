import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';

export class Entity extends Service {
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
}
