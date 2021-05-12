import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../../../declarations';
import { HookReturn } from 'sequelize/types/lib/hooks';

export default function (app: Application): typeof Model {
    const sequelizeClient: Sequelize = app.get('sequelizeClient');
    const userRoleProject = sequelizeClient.define('user_role_project', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV1,
            allowNull: false,
            primaryKey: true
        }
    }, {
        hooks: {
            beforeCount(options: any): HookReturn {
                options.raw = true;
            }
        }
    });

    (userRoleProject as any).associate = function (models: any): void {
    };

    return userRoleProject;
}