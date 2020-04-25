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

  (organizationUser as any).associate = function (models: any) {
    (organizationUser as any).belongsTo(models.user, { foreignKey: 'userId' });
    (organizationUser as any).belongsTo(models.organization, { foreignKey: 'organizationId' });
    (organizationUser as any).hasOne(models.organization_user_rank, { foreignKey: 'organizationUserRank' })
  }

  return organizationUser
}
