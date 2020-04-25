import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'
// import Location from './location.model'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const instance = sequelizeClient.define('instance', {
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    maxUsers: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
    // TODO: currentUsers: {}  
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (instance as any).associate = (models: any) => (instance as any).belongsTo(models.location)

  return instance
}
