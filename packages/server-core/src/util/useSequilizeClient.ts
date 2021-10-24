import { Sequelize } from 'sequelize/types'
import { Application, Models } from '../../declarations'

export const useSequilizeClient = (app: Application): Sequelize => {
  return app.get('sequelizeClient')
}

export const useSequilizeModels = (app: Application): Models => {
  return app.get('sequelizeClient').models
}
