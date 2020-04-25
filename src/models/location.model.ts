// A place in physical or virtual space, with many copies (instances)
import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const location = sequelizeClient.define('location', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sceneId: {
      type: DataTypes.STRING,
      allowNull: true //TODO: this is for now only
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
  // Has many instances
  (location as any).associate = (models: any) =>
    (location as any).hasMany(models.instance)

  return location
}
