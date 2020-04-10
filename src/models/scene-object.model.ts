// Model for junction between a scene and it's objects
import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const SceneObject = sequelizeClient.define('scene_object', {
    text: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCount(options: any) {
        options.raw = true;
      }
    }
  });

  return SceneObject;
}
