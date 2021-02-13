import { Sequelize } from 'sequelize';
import { Application } from '../declarations';

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const projectAsset = sequelizeClient.define('project_asset', {
  }, {
    hooks: {
      beforeCount (options: any): void {
        options.raw = true;
      }
    }
  });

  (projectAsset as any).associate = (models: any): void => {
    (projectAsset as any).belongsTo(models.project, { foreignKey: 'projectId', allowNull: false, primaryKey: true });
    (projectAsset as any).belongsTo(models.asset, { foreignKey: 'assetId', allowNull: false, primaryKey: true });
  };

  return projectAsset;
};
