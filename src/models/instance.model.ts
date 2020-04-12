import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'
// import Location from './location.model'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Instance = sequelizeClient.define('instance', {
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  })

  return Instance
}
