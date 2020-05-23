// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';

export default function (app: Application) {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const seat = sequelizeClient.define('seat', {
    
  }, {
    hooks: {
      beforeCount(options: any) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  (seat as any).associate = function (models: any) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    (seat as any).belongsTo(models.subscription, { foreignKey: { name: 'subscriptionId', allowNull: false } })
    ;(seat as any).belongsTo(models.user, { foreignKey: { name: 'userId', allowNull: false }})
    ;(seat as any).belongsTo(models.seat_status, { foreignKey: { name: 'seatStatus', allowNull: false }})
  };

  return seat;
}
