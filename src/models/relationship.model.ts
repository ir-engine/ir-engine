import { Sequelize } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const relationship = sequelizeClient.define('relationship', {
  }, {
    hooks: {
      beforeCount (options: any): any {
        options.raw = true
      }
    }
  });

  (relationship as any).associate = (models: any) => {
    (relationship as any).hasOne(models.user, {
      foreignKey: {
        name: 'user',
        allowNull: true
      }
    });
    (relationship as any).hasOne(models.user, {
      foreignKey: {
        name: 'relatedUser',
        allowNull: true // True to allow seeder to work
        // TODO: Set allowNull to false and fix seeder error
      }
    });
    (relationship as any).belongsTo(models.relationship_type)
  }

  return relationship
}
