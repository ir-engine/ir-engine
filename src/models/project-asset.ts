// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const projectAsset = sequelizeClient.define('project_assets', {
    project_asset_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    asset_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  (projectAsset as any).associate = (models: any) => {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    (projectAsset as any).belongsTo(models.project);
    (projectAsset as any).belongsTo(models.asset)
  }

  return projectAsset
}
