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
    (relationship as any).belongsTo(models.user, { foreignKey: { name: 'userOneId' }, as: 'userOne' });
    (relationship as any).belongsTo(models.user, { foreignKey: 'userTwoId', as: 'userTwo' });
    (relationship as any).hasOne(models.relationship_type, { foreignKey: 'userOneRelationshipType' });
    (relationship as any).hasOne(models.relationship_type, { foreignKey: 'userTwoRelationshipType' })
  }

  return relationship
}
