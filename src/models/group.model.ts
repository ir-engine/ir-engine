import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Group = sequelizeClient.define('group', {
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (Group as any).associate = (models: any) => {
    (Group as any).belongsToMany(models.user, { through: models.group_user })
  }
  return Group
}
