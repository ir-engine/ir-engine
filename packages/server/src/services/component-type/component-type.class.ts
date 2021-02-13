import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';


/**
 * A class for Component type service 
 * 
 * @author Vyacheslav Solovjov
 */
export class ComponentType extends Service {
  public docs: any
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
}
