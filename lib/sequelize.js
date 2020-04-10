"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (app) => {
    var _a, _b, _c, _d;
    let connectionString;
    if (process.env.KUBERNETES === 'true') {
        const dbUser = (_a = process.env.MYSQL_USER) !== null && _a !== void 0 ? _a : '';
        const dbPass = (_b = process.env.MYSQL_PASSWORD) !== null && _b !== void 0 ? _b : '';
        const dbHost = (_c = process.env.MYSQL_HOST) !== null && _c !== void 0 ? _c : '';
        const dbName = (_d = process.env.MYSQL_DATABASE) !== null && _d !== void 0 ? _d : '';
        connectionString = 'mysql://' + dbUser + ':' + dbPass + '@' + dbHost + ':3306/' + dbName;
    }
    else {
        connectionString = app.get('mysql');
    }
    const sequelize = new sequelize_1.Sequelize(connectionString, {
        dialect: 'mysql',
        logging: false,
        define: {
            freezeTableName: true
        }
    });
    const oldSetup = app.setup;
    app.set('sequelizeClient', sequelize);
    app.setup = function (...args) {
        // Set up data relationships
        const models = sequelize.models;
        Object.keys(models).forEach(name => { var _a; return (_a = 'associate' in models[name]) !== null && _a !== void 0 ? _a : models[name].associate(models); });
        app.set('sequelizeSync', sequelize.sync()); // Sync to the database
        return oldSetup.apply(this, args);
    };
};
