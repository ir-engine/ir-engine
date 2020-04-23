import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const userCollection = sequelizeClient.define('user_collection', {
    name: {
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

  (userCollection as any).associate = (models: any) => {
    (userCollection as any).hasOne(models.user);
    (userCollection as any).hasOne(models.collection)
  }

  return userCollection
}
