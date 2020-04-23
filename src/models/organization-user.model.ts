import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const organizationUser = sequelizeClient.define('organization_user', {
    text: {
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

  (organizationUser as any).associate = (models: any) => {
    (organizationUser as any).hasOne(models.organization, { foreignKey: 'id' });
    (organizationUser as any).hasOne(models.user, { foreignKey: 'userId' })
  }

  return organizationUser
}
