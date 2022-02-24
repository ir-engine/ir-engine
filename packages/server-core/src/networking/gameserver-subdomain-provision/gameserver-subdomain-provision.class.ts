import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { GameserverSubdomainProvisionInterface } from '@xrengine/common/src/dbmodels/GameserverSubdomainProvision'

export type GameServerSubdomainProvisionDataType = GameserverSubdomainProvisionInterface

/**
 * A class for Game server domain provision  service
 *
 * @author Vyacheslav Solovjov
 */
export class GameserverSubdomainProvision<T = GameServerSubdomainProvisionDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
