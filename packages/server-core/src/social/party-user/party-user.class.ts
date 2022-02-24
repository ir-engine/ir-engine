import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { PartyUser as PartyUserDataType } from '@xrengine/common/src/interfaces/PartyUser'
/**
 * A class for Party user service
 *
 * @author Vyacheslav Solovjov
 */
export class PartyUser<T = PartyUserDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
