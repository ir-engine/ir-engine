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
            type: sequelize_1.DataTypes.STRING
        },
        auth0Id: { type: sequelize_1.DataTypes.STRING },
        googleId: { type: sequelize_1.DataTypes.STRING },
        facebookId: { type: sequelize_1.DataTypes.STRING },
        twitterId: { type: sequelize_1.DataTypes.STRING },
        githubId: { type: sequelize_1.DataTypes.STRING },
        isVerified: { type: sequelize_1.DataTypes.BOOLEAN },
        verifyToken: { type: sequelize_1.DataTypes.STRING },
        verifyShortToken: { type: sequelize_1.DataTypes.STRING },
        verifyExpires: { type: sequelize_1.DataTypes.DATE },
        verifyChanges: { type: sequelize_1.DataTypes.JSON },
        resetToken: { type: sequelize_1.DataTypes.STRING },
        resetExpires: { type: sequelize_1.DataTypes.DATE },
        created: { type: sequelize_1.DataTypes.DATE }
    }, {
        hooks: {
            beforeCount(options) {
                options.raw = true;
            }
        }
    });
    users.associate = function (models) {
        users.hasMany(models.xr_avatars);
        // belongs to many Groups
        // has one Contacts list
    };
    return users;
}
exports.default = default_1;
