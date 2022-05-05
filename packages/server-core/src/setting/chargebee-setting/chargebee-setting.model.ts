import { DataTypes, Model, Sequelize } from 'sequelize'

import { ChargebeeSettingInterface } from '@xrengine/common/src/dbmodels/ChargebeeSetting'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const ChargebeeSetting = sequelizeClient.define<Model<ChargebeeSettingInterface>>('chargebeeSetting', {
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
    apiKey: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })

  return ChargebeeSetting
}
