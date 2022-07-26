import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize'

import { PartyUserInterface } from '@xrengine/common/src/dbmodels/PartyUser'

export type PartyUserModel = Model<Partial<PartyUserInterface>>
export type PartyUserModelStatic = ModelStatic<PartyUserModel>

export default (sequelizeClient: Sequelize) => {
  const partyUser = sequelizeClient.define<PartyUserModel>(
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

  ;(partyUser as any).associate = (models: typeof Sequelize.prototype.models): void => {
    partyUser.belongsTo(models.party)
    partyUser.belongsTo(models.user)
  }

  return partyUser
}
