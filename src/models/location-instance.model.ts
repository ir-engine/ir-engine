import { Sequelize } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
    const sequelizeClient: Sequelize = app.get('sequelizeClient')
    const locationInstance = sequelizeClient.define('location_instance', {}, {
        hooks: {
            beforeCount (options: any) {
                options.raw = true
            }
        }
    });

    (locationInstance as any).associate = function (models: any) {
        (locationInstance as any).hasOne(models.location);
        (locationInstance as any).hasOne(models.instance)        
    }

    return locationInstance
}