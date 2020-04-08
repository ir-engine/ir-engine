// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  /**
   * A 3D Model / skeleton, blob. Multiple standard models/formats.
   * There’ll be a list of public templates, but users can have their own, or
   * custom ones.
   */
  const xrAvatars = sequelizeClient.define('xr_avatars', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    format: {
      type: DataTypes.STRING, // for now, foreign key into formats table later
      allowNull: false
    },
    thumbnail: {
      type: DataTypes.STRING // url to image
    },
    owner: {
      type: DataTypes.STRING // user id
    }
    // TODO: Model Attribution/Created By (same as for XRObject)
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (xrAvatars as any).associate = function (models: any) {
    (xrAvatars as any).hasMany(models.avatars)
    // has one owner
  }

  return xrAvatars
}
