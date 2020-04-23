import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const userEntity = sequelizeClient.define('user_entity', {
    text: {
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

  (userEntity as any).associate = (models: any) => {
    (userEntity as any).hasOne(models.user);
    (userEntity as any).hasOne(models.entity)
  }

  return userEntity
}
