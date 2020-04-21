import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const userResource = sequelizeClient.define('user_resource', {
    text: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (userResource as any).associate = (models: any) => {
    (userResource as any).hasOne(models.user);
    (userResource as any).hasOne(models.resource)
  }

  return userResource
}
