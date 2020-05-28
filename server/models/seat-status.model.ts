import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const seatStatus = sequelizeClient.define('seat_status', {
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'unread'
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (seatStatus as any).associate = function (models: any) {
    (seatStatus as any).hasMany(models.seat, { foreignKey: 'seatStatus' })
  }

  return seatStatus
}
