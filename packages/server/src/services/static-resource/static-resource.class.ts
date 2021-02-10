import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';

/**
 * A class for Static Resource  service 
 * 
 * @author Vyacheslav Solovjov
 */
export class StaticResource extends Service {
  public docs: any
  
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
}
