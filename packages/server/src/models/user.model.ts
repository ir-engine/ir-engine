import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';
import GenerateRandomAnimalName from 'random-animal-name-generator';
import { capitalize } from '../util/capitalize';

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const User = sequelizeClient.define(
    'user',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        defaultValue: () => capitalize(GenerateRandomAnimalName()),
        allowNull: false
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true;
        }
      }
    }
  );

  (User as any).associate = (models: any): void => {
    (User as any).belongsTo(models.user_role, { foreignKey: 'userRole' });
    (User as any).belongsTo(models.instance, { foreignKey: { allowNull: true } }); // user can only be in one room at a time
    (User as any).hasOne(models.user_settings);
    (User as any).belongsTo(models.party, { through: 'party_user' }); // user can only be part of one party at a time
    (User as any).hasMany(models.collection);
    (User as any).belongsToMany(models.user, {
      as: 'relatedUser',
      through: models.user_relationship
    });
    (User as any).hasMany(models.user_relationship);
    (User as any).belongsToMany(models.group, { through: 'group_user' }); // user can join multiple orgs
    (User as any).hasMany(models.group_user, { unique: false });
    (User as any).hasMany(models.identity_provider);
    (User as any).hasMany(models.static_resource);
    (User as any).hasMany(models.subscription);
    (User as any).hasMany(models.channel, { foreignKey: 'userId1' });
    (User as any).hasMany(models.channel, { foreignKey: 'userId2' });
    (User as any).hasOne(models.seat, { foreignKey: 'userId' });
    (User as any).belongsToMany(models.location, { through: 'location_admin' });
    (User as any).hasMany(models.location_admin, { unique: false });
    (User as any).hasMany(models.location_ban);
  };

  return User;
};
