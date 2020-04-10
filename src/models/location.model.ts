// A place in physical or virtual space, with many copies (instances)
import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';
export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const Location = sequelizeClient.define('location', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sceneId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    maxUsersPerInstance: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    access: {
      type: DataTypes.STRING
    }
  }, {
    hooks: {
      beforeCount(options: any) {
        options.raw = true;
      }
    }
  });
  // Has many instances
  (Location as any).associate = (models: any) =>
    (Location as any).hasMany(models.instance)

  return Location;
}
