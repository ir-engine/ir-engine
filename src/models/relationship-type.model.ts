import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const relationshipType = sequelizeClient.define('relationship_type', {
    name: {
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

  (relationshipType as any).associate = function (models: any) {
    (relationshipType as any).belongsTo(models.relationship, { foreignKey: 'userOneRelationshipType' });
    (relationshipType as any).belongsTo(models.relationship, { foreignKey: 'userTwoRelationshipType' })
  }

  return relationshipType
}
