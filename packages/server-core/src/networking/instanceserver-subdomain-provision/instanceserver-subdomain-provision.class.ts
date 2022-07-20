import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { InstanceserverSubdomainProvisionInterface } from '@xrengine/common/src/dbmodels/InstanceserverSubdomainProvision'

import { Application } from '../../../declarations'

export type InstanceserverSubdomainProvisionDataType = InstanceserverSubdomainProvisionInterface

/**
 * A class for instance server domain provision  service
 */
export class InstanceserverSubdomainProvision<T = InstanceserverSubdomainProvisionDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
