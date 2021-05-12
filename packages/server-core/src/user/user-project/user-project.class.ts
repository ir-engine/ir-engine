import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../../declarations';

/**
 * A class user to assign user to a project 
 * 
 * @author KIMENYI Kevin
 */
export class UserProject extends Service {
  public docs: any
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
}
