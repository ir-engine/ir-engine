import { DataTypes, Model, Sequelize } from 'sequelize'

import { AnalyticsSettingInterface } from '@xrengine/common/src/dbmodels/AnalyticsSetting'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Analytics = sequelizeClient.define<Model<AnalyticsSettingInterface>>('analyticsSetting', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    port: {
      type: DataTypes.STRING,
      allowNull: true
    },
    processInterval: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })
  return Analytics
}
