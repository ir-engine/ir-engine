import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { RtcPortsInterface } from '@xrengine/common/src/dbmodels/RtcPorts'

export type RtcPortsDataType = RtcPortsInterface
/**
 * A class for Rtc Ports  service
 *
 * @author Vyacheslav Solovjov
 */
export class RtcPorts<T = RtcPortsDataType> extends Service<T> {
  public docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
