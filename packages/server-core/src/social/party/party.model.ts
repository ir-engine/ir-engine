import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Party = sequelizeClient.define(
    'party',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
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

  ;(Party as any).associate = (models: any): void => {
    ;(Party as any).belongsToMany(models.user, { through: 'party_user' })
    ;(Party as any).hasMany(models.party_user, { unique: false })
    ;(Party as any).belongsTo(models.instance)
    ;(Party as any).belongsTo(models.location, { onDelete: 'cascade', hooks: true })
  }
  return Party
}
