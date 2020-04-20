import { Sequelize } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const entity = sequelizeClient.define('entity', {
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (entity as any).associate = function (models: any) { }

  return entity
}
