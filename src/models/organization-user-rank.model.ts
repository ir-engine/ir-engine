import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const organizationUserRank = sequelizeClient.define('organization_user_rank', {
    rank: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (organizationUserRank as any).associate = (models: any): any => {
    (organizationUserRank as any).belongsTo(models.organization);
    (organizationUserRank as any).belongsToMany(models.user, { through: models.organization_user, foreignKey: 'organizationUserRank' })
  }

  return organizationUserRank
}
