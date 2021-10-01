import { DataTypes, Sequelize } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const ChargebeeSetting = sequelizeClient.define('chargebeeSetting', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    apikey: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })

  return ChargebeeSetting
}
