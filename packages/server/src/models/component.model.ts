import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const component = sequelizeClient.define('component', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.VIRTUAL,
      get (this: any): any {
        return this.type;
      }
    },
    // We need to get this for making compatible with editor
    props: {
      type: DataTypes.VIRTUAL,
      get (this: any): any {
        if (!this.data) {
          return {};
        } else {
          return this.data;
        }
      }
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
      get (this: any): string | JSON {
        const data = this.getDataValue('data');
        if (!data) {
          return '';
        } else {
          return JSON.parse(data);
        }
      }
    },
    entityId: {
      type: DataTypes.UUID
    }
  }, {
    hooks: {
      beforeCount (options: any): void {
        options.raw = true;
      }
    }
  });
  (component as any).associate = (models: any): void => {
    (component as any).belongsTo(models.component_type, { foreignKey: 'type', required: false, constaints: false });
    (component as any).belongsTo(models.entity, { as: 'entity', foreignKey: 'entityId', required: false, constaints: false, onDelete: 'cascade', hooks: true });
    (component as any).hasMany(models.static_resource, { constraints: false });
  };

  return component;
};
