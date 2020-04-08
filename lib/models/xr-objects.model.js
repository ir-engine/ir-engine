"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const sequelize_1 = require("sequelize");
function default_1(app) {
    const sequelizeClient = app.get('sequelizeClient');
    /**
     * An asset file / image / model.
     */
    const xrObjects = sequelizeClient.define('xr_objects', {
        format: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        objectType: {
            type: sequelize_1.DataTypes.STRING
        }
    }, {
        hooks: {
            beforeCount(options) {
                options.raw = true;
            }
        }
    });
    xrObjects.associate = function (models) {
        xrObjects.belongsTo(models.users); // or group
        // belongs in many XrScenes
        // TODO: Model Attribution/Created By (same as for XrAvatar)
    };
    return xrObjects;
}
exports.default = default_1;
