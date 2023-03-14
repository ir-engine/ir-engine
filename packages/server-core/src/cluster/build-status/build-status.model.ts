import { DataTypes, Model, Sequelize } from 'sequelize'

import { BuildStatusInterface } from '@etherealengine/common/src/dbmodels/BuildStatus'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const BuildStatus = sequelizeClient.define<Model<BuildStatusInterface>>(
    'build_status',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'pending'
      },
      logs: {
        type: DataTypes.TEXT('medium')
      },
      dateStarted: {
        type: DataTypes.DATE
      },
      dateEnded: {
        type: DataTypes.DATE
      },
      commitSHA: {
        type: DataTypes.STRING
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      }
    }
  )

  ;(BuildStatus as any).associate = (models: any): void => {}

  return BuildStatus
}
