import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Params } from '@feathersjs/feathers'
import { QueryTypes } from 'sequelize'

/**
 * A class for Collection type service
 *
 * @author DRC
 */
export class UserInventory extends Service {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>) {
    super(options)
  }
}
