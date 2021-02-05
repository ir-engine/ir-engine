import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';

/**
 * A class for component type service 
 * 
 * @author Vyacheslav Solovjov
 */
export class Component extends Service {
  docs: any
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
}
