"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const sequelize_1 = require("sequelize");
function default_1(app) {
    const sequelizeClient = app.get('sequelizeClient');
    /**
     * A particular location has many Instances, for load balancing users. Users
     * can only talk to other people in the same instance. Instances are
     * dynamically allocated; when you join a location, you’re assigned (round
     * robin at first) to a particular instance. (Think “instance dungeon” in an
     * MMO.)
     */
    const xrLocationInstances = sequelizeClient.define('xr_location_instances', {
        created: {
            type: sequelize_1.DataTypes.DATE
        }
    }, {
        hooks: {
            beforeCount(options) {
                options.raw = true;
            }
        }
    });
    xrLocationInstances.associate = function (models) {
        xrLocationInstances.belongsTo(models.xr_locations);
        // (xrLocationInstances as any).belongsTo(models.xr_scenes)
    };
    return xrLocationInstances;
}
exports.default = default_1;
