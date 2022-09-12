import { DataTypes, Model, Sequelize } from 'sequelize'

import { AvatarInterface } from '@xrengine/common/src/dbmodels/AvatarResource'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Avatar = sequelizeClient.define<Model<AvatarInterface>>(
    'avatar',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      identifierName: {
        type: DataTypes.STRING,
        unique: true
      },
      modelResourceId: {
        type: DataTypes.STRING
      },
      thumbnailResourceId: {
        type: DataTypes.STRING
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      userId: {
        type: DataTypes.UUID
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

  ;(Avatar as any).associate = (models: any): void => {
    ;(Avatar as any).hasMany(models.user)
  }

  return Avatar
}
