import { DataTypes, Model, Sequelize } from 'sequelize'

import { RigInterface } from '@etherealengine/common/src/dbmodels/Rig'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const rig = sequelizeClient.define<Model<RigInterface>>(
    'rig',
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

  ;(rig as any).associate = (models: any): void => {
    ;(rig as any).hasMany(models.animation, {
      foreignKey: 'animation',
      required: true
    })
  }

  return rig
}
