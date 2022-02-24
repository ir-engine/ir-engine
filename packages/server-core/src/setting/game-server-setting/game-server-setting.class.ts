import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { GameServerSetting as GameServerSettingInterface } from '@xrengine/common/src/interfaces/GameServerSetting'

export type GameServerSettingDataType = GameServerSettingInterface

export class GameServerSetting<T = GameServerSettingDataType> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
