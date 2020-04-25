// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const ownedFile = sequelizeClient.define('owned_file', {
    owned_file_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    owned_file_uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false
    },
    account_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    content_length: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  (ownedFile as any).associate = (models: any) => {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    ;(ownedFile as any).belongsTo(models.user, { foreignKey: 'account_id' })
  }

  return ownedFile
}
