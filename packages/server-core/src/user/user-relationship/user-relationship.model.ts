import { DataTypes, Sequelize } from 'sequelize'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const userRelationship = sequelizeClient.define(
    'user_relationship',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
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

  ;(userRelationship as any).associate = (models: any): void => {
    ;(userRelationship as any).belongsTo(models.user, { as: 'user', constraints: false })
    ;(userRelationship as any).belongsTo(models.user, { as: 'relatedUser', constraints: false })
    ;(userRelationship as any).belongsTo(models.user_relationship_type, { foreignKey: 'type' })
  }

  return userRelationship
}
