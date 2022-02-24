import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { SeatStatus as SeatStatusInterface } from '@xrengine/common/src/interfaces/SeatStatus'

export type SeatStatusDataType = SeatStatusInterface
/**
 * A class for Seat Status service
 *
 * @author Vyacheslav Solovjov
 */
export class SeatStatus<T = SeatStatusDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
