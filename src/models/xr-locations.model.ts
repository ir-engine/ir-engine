// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  /**
   * These are the “rooms” that get listed on the front page (or are unlisted,
   * which you can only access via direct link). UI-wise, users “join” a
   * location, but they’re actually assigned to one of the many instances for
   * that location.
   */
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
    (xrLocations as any).hasMany(models.xr_location_instances)
  }

  return xrLocations
}
