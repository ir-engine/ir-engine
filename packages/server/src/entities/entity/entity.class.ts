import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';

/**
 * A class for Entity service 
 * 
 * @author Vyacheslav Solovjov
 */
export class Entity extends Service {
  docs: any
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
}
