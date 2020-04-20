import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const component = sequelizeClient.define('component', {
    data: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  (component as any).associate = (models: any) => {
    (component as any).hasOne(models.component_type);
    (component as any).hasOne(models.entity)
  }

  return component
}
