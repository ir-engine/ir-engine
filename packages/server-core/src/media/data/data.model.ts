import { DataTypes, Model, Sequelize } from 'sequelize'

import { DataInterface } from '@etherealengine/common/src/dbmodels/Data'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const data = sequelizeClient.define<Model<DataInterface>>(
    'data',
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
      },
      type: {
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

  ;(data as any).associate = (models: any): void => {
    ;(data as any).belongsTo(models.static_resource, {
      foreignKey: 'staticResourceId',
      as: 'staticResource',
      required: true
    })
  }

  return data
}
