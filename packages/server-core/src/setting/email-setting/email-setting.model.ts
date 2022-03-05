import { DataTypes, Model, Sequelize } from 'sequelize'

import { EmailSettingInterface } from '@xrengine/common/src/dbmodels/EmailSetting'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const EmailSetting = sequelizeClient.define<Model<EmailSettingInterface>>(
    'emailSetting',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      smtp: {
        type: DataTypes.JSON,
        allowNull: true
      },
      from: {
        type: DataTypes.STRING,
        allowNull: true
      },
      subject: {
        type: DataTypes.JSON,
        allowNull: true
      },
      smsNameCharacterLimit: {
        type: DataTypes.INTEGER
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

  return EmailSetting
}
