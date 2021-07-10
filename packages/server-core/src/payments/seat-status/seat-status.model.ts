import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const seatStatus = sequelizeClient.define(
    'seat_status',
    {
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      },
      timestamps: false
    }
  )

  ;(seatStatus as any).associate = (models: any): void => {
    ;(seatStatus as any).hasMany(models.seat, { foreignKey: 'seatStatus' })
  }

  return seatStatus
}
