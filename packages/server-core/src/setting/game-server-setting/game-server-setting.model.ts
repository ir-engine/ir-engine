import { DataTypes, Sequelize } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const gameServerSetting = sequelizeClient.define(
    'gameServerSetting',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      clientHost: {
        type: DataTypes.STRING,
        allowNull: true
      },
      rtc_start_port: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      rtc_end_port: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      rtc_port_block_size: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      identifierDigits: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      local: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      domain: {
        type: DataTypes.STRING,
        allowNull: true
      },
      releaseName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      port: {
        type: DataTypes.STRING,
        allowNull: true
      },
      mode: {
        type: DataTypes.STRING,
        allowNull: true
      },
      locationName: {
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

  return gameServerSetting
}
