/**
 * A 3D Model / skeleton, blob. Multiple standard models/formats.
 * There’ll be a list of public templates, but user can have their own
 */

import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Avatar = sequelizeClient.define('avatar', {
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
    // TODO: Model Attribution/Created By (same as for Object)
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });
  // has one owner
  (Avatar as any).associate = (models: any) =>
    (Avatar as any).belongsTo(models.user)

  return Avatar
}
