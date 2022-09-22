// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { DataTypes, Model, Sequelize } from 'sequelize'
import { HookReturn } from 'sequelize/types/hooks'

import { LocationSettingsInterface } from '@xrengine/common/src/dbmodels/LocationSettings'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const LocationSettings = sequelizeClient.define<Model<LocationSettingsInterface>>(
    'location_settings',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      videoEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      audioEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      screenSharingEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      faceStreamingEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      instanceMediaChatEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      hooks: {
        beforeCount(options: any): HookReturn {
          options.raw = true
        }
      }
    }
  )

  ;(LocationSettings as any).associate = function (models: any): void {
    ;(LocationSettings as any).belongsTo(models.location, { required: true, allowNull: false })
    ;(LocationSettings as any).belongsTo(models.location_type, { foreignKey: 'locationType', defaultValue: 'private' })
  }

  return LocationSettings
}
