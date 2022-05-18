import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { GameServerSetting as GameServerSettingInterface } from '@xrengine/common/src/interfaces/GameServerSetting'

import { Application } from '../../../declarations'

export type GameServerSettingDataType = GameServerSettingInterface

export class GameServerSetting<T = GameServerSettingDataType> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
