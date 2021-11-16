import { Application } from '@xrengine/server-core/declarations'
import { DataTypes, Sequelize } from 'sequelize'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Preset = sequelizeClient.define(
    'preset',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      presetName: {
        type: DataTypes.STRING,
        defaultValue: (): string => '',
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

  ;(Preset as any).associate = (models: any): void => {
    ;(Preset as any).belongsTo(models.team, { foreignKey: 'teamId', allowNull: false })
  }

  return Preset
}
