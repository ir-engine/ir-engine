import { Sequelize } from 'sequelize/types'

import { Models } from '@xrengine/common/declarations'

import { Application } from '../../declarations'

export const useSequelizeClient = (app: Application): Sequelize => {
  return app.get('sequelizeClient')
}

export const useSequelizeModels = (app: Application): Models => {
  return app.get('sequelizeClient').models
}
