import { DataTypes, Sequelize } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const RedisSetting = sequelizeClient.define('redisSetting', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    port: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })

  return RedisSetting
}
