"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const sequelize_1 = require("sequelize");
function default_1(app) {
    const sequelizeClient = app.get('sequelizeClient');
    const users = sequelizeClient.define('users', {
        email: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        auth0Id: { type: sequelize_1.DataTypes.STRING },
        googleId: { type: sequelize_1.DataTypes.STRING },
        facebookId: { type: sequelize_1.DataTypes.STRING },
        twitterId: { type: sequelize_1.DataTypes.STRING },
        githubId: { type: sequelize_1.DataTypes.STRING },
    }, {
        hooks: {
            beforeCount(options) {
                options.raw = true;
            }
        }
    });
    // eslint-disable-next-line no-unused-vars
    users.associate = function (models) {
        // Define associations here
        // See http://docs.sequelizejs.com/en/latest/docs/associations/
    };
    return users;
}
exports.default = default_1;
