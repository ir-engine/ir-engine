import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { InstanceAttendanceInterface } from '@xrengine/common/src/dbmodels/InstanceAttendance'

import { Application } from '../../../declarations'

export type InstanceAttendanceDataType = InstanceAttendanceInterface

/**
 * A class for Intance service
 *
 * @author Vyacheslav Solovjov
 */
export class InstanceAttendance<T = InstanceAttendanceDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
