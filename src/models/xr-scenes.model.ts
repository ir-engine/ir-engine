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
    },
    blobId: DataTypes.STRING
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (xrScenes as any).associate = function (models: any) {
    this.belongsTo(models.users) // or group
    this.belongsToMany(models.xr_objects, { through: models.xr_objects_scenes })
    // many-to-many association with XrLocations
  }

  return xrScenes
}
