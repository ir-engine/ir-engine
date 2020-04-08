// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const xrLocations = sequelizeClient.define('xr_locations', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    maxUsersPerInstance: {
      type: DataTypes.NUMBER
    },
    access: {
      type: DataTypes.STRING
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (xrLocations as any).associate = function (models: any) {
    (xrLocations as any).hasMany(models.instances)
  }

  return xrLocations
}
