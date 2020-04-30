import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const scene = sequelizeClient.define('scene', {
    blobId: {
      type: DataTypes.STRING
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (scene as any).associate = (models: any) => {
  }

  return scene
}
