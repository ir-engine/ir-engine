import { DataTypes, Model, Sequelize } from 'sequelize'

import { TaskServerSettingInterface } from '@etherealengine/common/src/dbmodels/TaskServerSetting'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const taskServerSetting = sequelizeClient.define<Model<TaskServerSettingInterface>>('taskServerSetting', {
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
  return taskServerSetting
}
