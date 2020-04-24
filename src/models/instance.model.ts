import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'
// import Location from './location.model'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Instance = sequelizeClient.define('instance', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
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
  });

  (Instance as any).associate = (models: any) => {
    (Instance as any).belongsTo(models.location);
    (Instance as any).hasMany(models.user)
  }
  return Instance
}
