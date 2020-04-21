import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const entityComponent = sequelizeClient.define('entity_component', {
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

  (entityComponent as any).associate = function (models: any) {
    (entityComponent as any).hasOne(models.entity);
    (entityComponent as any).hasOne(models.component)
  }

  return entityComponent
}
