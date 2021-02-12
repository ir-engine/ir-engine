import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';


/**
 * A class for Project Asset service 
 * 
 * @author Vyacheslav Solovjov
 */
export class ProjectAsset extends Service {
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
}
