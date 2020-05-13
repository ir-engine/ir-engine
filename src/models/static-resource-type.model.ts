import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const staticResourceType = sequelizeClient.define('static_resource_type', {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      },
      beforeUpdate (instance: any, options: any) {
        throw new Error("Can't update a type!")
      }
    },
    timestamps: false
  });

  (staticResourceType as any).associate = (models: any) => {
    (staticResourceType as any).hasMany(models.static_resource, { foreignKey: 'type' })
  }

  return staticResourceType
}
