import { DataTypes, Sequelize } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Bot = sequelizeClient.define(
    'bot',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        defaultValue: (): string => 'xrengine bot' + Math.floor(Math.random() * (999 - 100 + 1) + 100),
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
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

  ;(Bot as any).associate = (models: any): void => {
    ;(Bot as any).belongsTo(models.location, { foreignKey: 'locationId' })
    ;(Bot as any).belongsTo(models.instance, { foreignKey: { allowNull: true } })
    ;(Bot as any).belongsTo(models.user, { foreignKey: 'userId' })
    ;(Bot as any).hasMany(models.botCommand, { foreignKey: 'botId' })
  }
  return Bot
}
