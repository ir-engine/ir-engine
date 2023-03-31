import { DataTypes, Model, Sequelize } from 'sequelize'

import { ClientSettingInterface } from '@etherealengine/common/src/dbmodels/ClientSetting'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  return sequelizeClient.define<Model<ClientSettingInterface>>(
    'clientSetting',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      logo: {
        type: DataTypes.STRING,
        allowNull: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true
      },
      shortTitle: {
        type: DataTypes.STRING,
        allowNull: true
      },
      url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      startPath: {
        type: DataTypes.STRING,
        allowNull: false
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
      },
      webmanifestLink: {
        type: DataTypes.STRING,
        allowNull: true
      },
      swScriptLink: {
        type: DataTypes.STRING,
        allowNull: true
      },
      appBackground: {
        type: DataTypes.STRING,
        allowNull: true
      },
      appTitle: {
        type: DataTypes.STRING,
        allowNull: true
      },
      appSubtitle: {
        type: DataTypes.STRING,
        allowNull: true
      },
      appDescription: {
        type: DataTypes.STRING,
        allowNull: true
      },
      appSocialLinks: {
        type: DataTypes.JSON,
        allowNull: true
      },
      themeSettings: {
        type: DataTypes.JSON,
        allowNull: true
      },
      themeModes: {
        type: DataTypes.JSON,
        allowNull: true
      },
      key8thWall: {
        type: DataTypes.STRING,
        allowNull: true
      },
      homepageLinkButtonEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      homepageLinkButtonRedirect: {
        type: DataTypes.STRING
      },
      homepageLinkButtonText: {
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
}
