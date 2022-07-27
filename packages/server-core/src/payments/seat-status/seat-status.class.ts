import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { SeatStatus as SeatStatusInterface } from '@xrengine/common/src/interfaces/SeatStatus'

import { Application } from '../../../declarations'

export type SeatStatusDataType = SeatStatusInterface
/**
 * A class for Seat Status service
 */
export class SeatStatus<T = SeatStatusDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
