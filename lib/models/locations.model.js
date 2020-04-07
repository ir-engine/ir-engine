"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const sequelize_1 = require("sequelize");
function default_1(app) {
    const sequelizeClient = app.get('sequelizeClient');
    const locations = sequelizeClient.define('locations', {
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        maxUsersPerInstance: {
            type: sequelize_1.DataTypes.NUMBER
        },
        access: {
            type: sequelize_1.DataTypes.BOOLEAN
        }
    }, {
        hooks: {
            beforeCount(options) {
                options.raw = true;
            }
        }
    });
    locations.associate = function (models) {
        // Define associations here
        locations.hasMany(models.instances);
    };
    return locations;
}
exports.default = default_1;
