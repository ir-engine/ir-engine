import { DataTypes, Model, Sequelize } from 'sequelize'

import { UserKick } from '@etherealengine/common/src/dbmodels/UserKick'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const userKick = sequelizeClient.define<Model<UserKick>>(
    'user_kick',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      duration: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      hooks: {
        beforeCount(options: any): any {
          options.raw = true
        }
      },
      indexes: [
        {
          unique: true,
          fields: ['id']
        }
      ]
    }
  )

  ;(userKick as any).associate = (models: any): void => {
    ;(userKick as any).belongsTo(models.user, { as: 'user' })
    ;(userKick as any).belongsTo(models.instance, { as: 'instance' })
  }

  return userKick
}
