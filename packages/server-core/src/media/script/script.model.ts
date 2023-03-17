import { DataTypes, Model, Sequelize } from 'sequelize'

import { ScriptInterface } from '@etherealengine/common/src/dbmodels/Script'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const script = sequelizeClient.define<Model<ScriptInterface>>(
    'script',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING
      },
      tags: {
        type: DataTypes.JSON
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

  ;(script as any).associate = (models: any): void => {
    ;(script as any).belongsTo(models.static_resource, {
      foreignKey: 'staticResourceId',
      required: true
    })
    ;(script as any).belongsTo(models.image, {
      foreignKey: 'thumbnailId',
      as: 'thumbnail',
      required: false
    })
  }

  return script
}
