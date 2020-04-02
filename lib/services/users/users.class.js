"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feathers_sequelize_1 = require("feathers-sequelize");
class Users extends feathers_sequelize_1.Service {
    constructor(options, app) {
        super(options);
    }
}
exports.Users = Users;
