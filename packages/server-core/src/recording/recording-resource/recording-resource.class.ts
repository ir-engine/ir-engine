import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { RecordingResourceResult } from '@etherealengine/common/src/interfaces/Recording'

import { Application } from '../../../declarations'

export type RecordingResourceDataType = RecordingResourceResult

export class RecordingResource<T = RecordingResourceDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
