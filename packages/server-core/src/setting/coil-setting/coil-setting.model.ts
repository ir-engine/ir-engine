import { DataTypes, Model, Sequelize } from 'sequelize'

import { CoilSettingInterface } from '@xrengine/common/src/dbmodels/CoilSetting'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const CoilSetting = sequelizeClient.define<Model<CoilSettingInterface>>('coilSetting', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    paymentPointer: {
      type: DataTypes.STRING,
      allowNull: true
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    clientSecret: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })

  return CoilSetting
}
