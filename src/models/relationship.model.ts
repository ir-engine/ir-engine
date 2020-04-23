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
    (relationship as any).belongsTo(models.user);
    (relationship as any).belongsTo(models.relationship_type)
  }

  return relationship
}
