"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const sequelize_1 = require("sequelize");
function default_1(app) {
    const sequelizeClient = app.get('sequelizeClient');
    /**
     * “A user made a thing”. A grouping of objects. A scene is assigned to a
     * Location.
     */
    const xrScenes = sequelizeClient.define('xr_scenes', {
        text: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        }
    }, {
        hooks: {
            beforeCount(options) {
                options.raw = true;
            }
        }
    });
    xrScenes.associate = function (models) {
        xrScenes.hasMany(models.xr_objects);
        // many-to-many association with XrLocations
    };
    return xrScenes;
}
exports.default = default_1;
