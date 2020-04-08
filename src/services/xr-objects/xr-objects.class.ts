import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'

export class XrObjects extends Service {
  constructor (options: Partial<SequelizeServiceOptions>, app: Application): any {
    super(options)
  }
}
