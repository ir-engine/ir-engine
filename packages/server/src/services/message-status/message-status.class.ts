import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';

export class MessageStatus extends Service {
  public docs: any
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
}
