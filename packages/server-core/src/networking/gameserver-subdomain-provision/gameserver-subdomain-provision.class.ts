import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { GameserverSubdomainProvisionInterface } from '@xrengine/common/src/dbmodels/GameserverSubdomainProvision'

import { Application } from '../../../declarations'

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
