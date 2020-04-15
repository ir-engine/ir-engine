import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Contact = sequelizeClient.define('contact', {
    owner: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Owner ID is required!' }
      }
    },
    contactId: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Contact ID is required!' }
      }
    },
    isMuted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['owner', 'contactId']
      }
    ]
  });

  // eslint-disable-next-line no-unused-vars
  (Contact as any).associate = (models: any) => {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/

    // (contactList as any).belongsTo(models.user, { foreignKey: 'owner', as: 'ownerUser' });
    (Contact as any).belongsTo(models.user, { foreignKey: 'contactId', as: 'contactDetail' })
  }
  return Contact
}
