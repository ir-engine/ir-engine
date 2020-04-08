"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const sequelize_1 = require("sequelize");
function default_1(app) {
    const sequelizeClient = app.get('sequelizeClient');
    /**
     * A 3D Model / skeleton, blob. Multiple standard models/formats.
     * There’ll be a list of public templates, but users can have their own, or
     * custom ones.
     */
    const xrAvatars = sequelizeClient.define('xr_avatars', {
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        format: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        thumbnail: {
            type: sequelize_1.DataTypes.STRING // url to image
        },
        owner: {
            type: sequelize_1.DataTypes.STRING // user id
        }
        // TODO: Model Attribution/Created By (same as for XRObject)
    }, {
        hooks: {
            beforeCount(options) {
                options.raw = true;
            }
        }
    });
    xrAvatars.associate = function (models) {
        xrAvatars.belongsTo(models.users);
        // has one owner
    };
    return xrAvatars;
}
exports.default = default_1;
