import { DataTypes, Model, Sequelize } from 'sequelize'

import { UserRelationshipInterface } from '@xrengine/common/src/dbmodels/UserRelationship'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const userRelationship = sequelizeClient.define<Model<UserRelationshipInterface>>(
    'user_relationship',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      }
    } as any,
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

  ;(userRelationship as any).associate = (models: any): void => {
    ;(userRelationship as any).belongsTo(models.user, { as: 'user', constraints: false })
    ;(userRelationship as any).belongsTo(models.user, { as: 'relatedUser', constraints: false })
    ;(userRelationship as any).belongsTo(models.user_relationship_type, { foreignKey: 'type' })
  }

  return userRelationship
}
