// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  /**
   * A particular location has many Instances, for load balancing users. Users
   * can only talk to other people in the same instance. Instances are
   * dynamically allocated; when you join a location, you’re assigned (round
   * robin at first) to a particular instance. (Think “instance dungeon” in an
   * MMO.)
   */
  const xrLocationInstances = sequelizeClient.define('xr_location_instances', {
    created: {
      type: DataTypes.DATE
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (xrLocationInstances as any).associate = function (models: any) {
    (xrLocationInstances as any).belongsTo(models.xr_locations)
    // (xrLocationInstances as any).belongsTo(models.xr_scenes)
  }

  return xrLocationInstances
}
