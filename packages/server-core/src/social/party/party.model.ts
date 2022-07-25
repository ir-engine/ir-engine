import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize'

import { PartyInterface } from '@xrengine/common/src/dbmodels/Party'

export type PartyModel = Model<Partial<PartyInterface>>
export type PartyModelStatic = ModelStatic<PartyModel>

export default (sequelizeClient: Sequelize) => {
  const Party = sequelizeClient.define<PartyModel>(
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
        defaultValue: ''
      },
      maxMembers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10
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

  ;(Party as any).associate = (models: typeof Sequelize.prototype.models): void => {
    Party.belongsToMany(models.user, { through: 'party_user' })
    Party.hasMany(models.party_user)
    Party.hasOne(models.channel, { onDelete: 'cascade' })
    // Party.belongsTo(models.instance, { onDelete: 'cascade' })
  }
  return Party
}
