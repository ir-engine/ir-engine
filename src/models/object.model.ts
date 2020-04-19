/* eslint-disable @typescript-eslint/func-call-spacing, no-unexpected-multiline */
// An asset file / image / model.
import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'
export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')

  const Objects = sequelizeClient.define('object', {
    format: { // content-type
      type: DataTypes.STRING,
      allowNull: false
    },
    objectType: { // to start with, 'static'
      type: DataTypes.STRING
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });
  // TODO: Model Attribution/Created By (same as for XrAvatar)
  (Objects as any).associate = (models: any) => {
  //   (Objects as any).belongsTo(models.user); // or group
  //    (Objects as any).belongsToMany(models.scene, { through: models.scene_object })
  }

  return Objects
}
