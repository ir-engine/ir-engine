import { Sequelize } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const seat = sequelizeClient.define('seat', {

  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (seat as any).associate = function (models: any) {
    (seat as any).belongsTo(models.subscription, { foreignKey: { name: 'subscriptionId', allowNull: false } });
    (seat as any).belongsTo(models.user, { foreignKey: { name: 'userId', allowNull: false } });
    (seat as any).belongsTo(models.seat_status, { foreignKey: { name: 'seatStatus', allowNull: false } })
  }

  return seat
}
