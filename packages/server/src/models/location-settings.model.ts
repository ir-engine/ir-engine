// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/lib/hooks';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const LocationSettings = sequelizeClient.define('location_settings', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    videoEnabled: {
      type: DataTypes.BOOLEAN
    },
    instanceMediaChatEnabled: {
      type: DataTypes.BOOLEAN
    }
  }, {
    hooks: {
      beforeCount(options: any): HookReturn {
        options.raw = true;
      }
    }
  });
  
  (LocationSettings as any).associate = function (models: any): void {
    (LocationSettings as any).belongsTo(models.location, { required: true, allowNull: false });
    (LocationSettings as any).belongsTo(models.location_type, { foreignKey: 'locationType', defaultValue: 'private' });
  };

  return LocationSettings;
}
