import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const staticResourceType = sequelizeClient.define('resource_type', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (staticResourceType as any).associate = (models: any) => {
    (staticResourceType as any).belongsToMany(models.static_resource)
  }

  return staticResourceType
}
