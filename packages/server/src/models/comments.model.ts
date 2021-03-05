// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/lib/hooks';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const comments = sequelizeClient.define('comments', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
      }
  }, {
    hooks: {
      beforeCount(options: any): HookReturn {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (comments as any).associate = (models: any): void => {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    (comments as any).belongsTo(models.user, { foreignKey: 'authorId', allowNull: false });
    (comments as any).belongsTo(models.feed, { foreignKey: 'feedId', allowNull: false });
    (comments as any).hasMany(models.comments_fires);
  };

  return comments;
}
