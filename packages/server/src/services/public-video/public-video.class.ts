import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';

/**
 * A class for Public Video  service 
 * 
 * @author Vyacheslav Solovjov
 */
export class PublicVideo extends Service {
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
}
