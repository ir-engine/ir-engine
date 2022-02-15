import { Sequelize, DataTypes, Model } from 'sequelize'
import { Application } from '../../../declarations'
import { PartyUserInterface } from '@xrengine/common/src/dbmodels/PartyUser'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const partyUser = sequelizeClient.define<Model<PartyUserInterface>>(
    'party_user',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      isOwner: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isInviteAccepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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

  ;(partyUser as any).associate = (models: any): void => {
    ;(partyUser as any).belongsTo(models.party, { primaryKey: true, required: true, allowNull: false })
    ;(partyUser as any).belongsTo(models.user, { primaryKey: true, required: true, allowNull: false })
  }

  return partyUser
}
