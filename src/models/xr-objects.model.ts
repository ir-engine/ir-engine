// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  /**
   * An asset file / image / model.
   */
  const xrObjects = sequelizeClient.define('xr_objects', {
    format: { // content-type
      type: DataTypes.STRING,
      allowNull: false
    },
    objectType: { // to start with, 'static'
      type: DataTypes.STRING
    },
    blobId: DataTypes.STRING
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (xrObjects as any).associate = function (models: any) {
    this.belongsTo(models.users) // or group
    this.belongsToMany(models.xr_scenes, { through: models.xr_objects_scenes })
    // TODO: Model Attribution/Created By (same as for XrAvatar)
  }

  return xrObjects
}
