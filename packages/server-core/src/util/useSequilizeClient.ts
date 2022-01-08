import { Sequelize } from 'sequelize/types'

import { Application, Models } from '../../declarations'

export const useSequelizeClient = (app: Application): Sequelize => {
  return app.get('sequelizeClient')
}

export const useSequelizeModels = (app: Application): Models => {
  return app.get('sequelizeClient').models
}
