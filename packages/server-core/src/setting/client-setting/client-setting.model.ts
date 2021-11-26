import { DataTypes, Sequelize } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const ClientSetting = sequelizeClient.define(
    'clientSetting',
    {
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
      logo: {
        type: DataTypes.STRING,
        allowNull: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true
      },
      url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      releaseName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      siteDescription: {
        type: DataTypes.STRING,
        allowNull: true
      },
      favicon32px: {
        type: DataTypes.STRING,
        allowNull: true
      },
      favicon16px: {
        type: DataTypes.STRING,
        allowNull: true
      },
      icon192px: {
        type: DataTypes.STRING,
        allowNull: true
      },
      icon512px: {
        type: DataTypes.STRING,
        allowNull: true
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

  return ClientSetting
}
