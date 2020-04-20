import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Contact = sequelizeClient.define('contact', {
    userId: {
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
    }
  });

  (Contact as any).associate = (models: any) =>
    (Contact as any).belongsTo(models.user)

  return Contact
}
