// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  /**
   * “A user made a thing”. A grouping of objects. A scene is assigned to a
   * Location.
   */
  const xrScenes = sequelizeClient.define('xr_scenes', {
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

  (xrScenes as any).associate = function (models: any) {
    (xrScenes as any).hasMany(models.xr_objects)
    // many-to-many association with XrLocations
  }

  return xrScenes
}
