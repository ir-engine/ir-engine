import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const partyUser = sequelizeClient.define('party_user', {
    isOwner: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isInviteAccepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (partyUser as any).associate = (models: any) => {
    (partyUser as any).belongsTo(models.party, { foreignKey: 'partyId' });
    (partyUser as any).belongsTo(models.user, { foreignKey: 'userId' })
  }

  return partyUser
}
