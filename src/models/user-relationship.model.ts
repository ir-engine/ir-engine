import { Sequelize } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const userRelationship = sequelizeClient.define('user_relationship', {
  }, {
    hooks: {
      beforeCount (options: any): any {
        options.raw = true
      }
    }
  });

  (userRelationship as any).associate = (models: any) => {
    (userRelationship as any).belongsTo(models.user, { as: 'user', constraints: false });
    (userRelationship as any).belongsTo(models.user, { as: 'relatedUser', constraints: false });
    (userRelationship as any).belongsTo(models.user_relationship_type, { foreignKey: 'type' })
  }

  return userRelationship
}
