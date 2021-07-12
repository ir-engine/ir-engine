import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'

/**
 * A class for Scene Listing service
 *
 * @author Vyacheslav Solovjov
 */
export class SceneListing extends Service {
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
