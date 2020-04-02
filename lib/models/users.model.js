"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(app) {
    const sequelizeClient = app.get('sequelizeClient');
    const users = sequelizeClient.define('users', {
        userId: {
            type: sequelize_1.DataTypes.STRING,
            unique: true
        },
        email: {
            type: sequelize_1.DataTypes.STRING
        },
        password: {
            type: sequelize_1.DataTypes.STRING,
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
        if (models)
            console.log(models);
        // Define associations here
        // See http://docs.sequelizejs.com/en/latest/docs/associations/
    };
    return users;
}
exports.default = default_1;
