import { DataTypes, Model, Sequelize } from 'sequelize'

import { ServerSettingInterface } from '@xrengine/common/src/dbmodels/ServerSetting'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const ServerSetting = sequelizeClient.define<Model<ServerSettingInterface>>(
    'serverSetting',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      hostname: {
        type: DataTypes.STRING,
        allowNull: true
      },
      mode: {
        type: DataTypes.STRING,
        allowNull: true
      },
      port: {
        type: DataTypes.STRING,
        allowNull: true
      },
      clientHost: {
        type: DataTypes.STRING,
        allowNull: true
      },
      rootDir: {
        type: DataTypes.STRING,
        allowNull: true
      },
      publicDir: {
        type: DataTypes.STRING,
        allowNull: true
      },
      nodeModulesDir: {
        type: DataTypes.STRING,
        allowNull: true
      },
      localStorageProvider: {
        type: DataTypes.STRING,
        allowNull: true
      },
      performDryRun: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      storageProvider: {
        type: DataTypes.STRING,
        allowNull: true
      },
      gaTrackingId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      hub: {
        type: DataTypes.JSON,
        allowNull: true
      },
      url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      certPath: {
        type: DataTypes.STRING,
        allowNull: true
      },
      keyPath: {
        type: DataTypes.STRING,
        allowNull: true
      },
      gitPem: {
        type: DataTypes.STRING(2048),
        allowNull: true
      },
      local: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      releaseName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      instanceserverUnreachableTimeoutSeconds: {
        type: DataTypes.INTEGER,
        defaultValue: 2
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

  return ServerSetting
}
