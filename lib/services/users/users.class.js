"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const feathers_sequelize_1 = require("feathers-sequelize");
const crypto_1 = __importDefault(require("crypto"));
class Users extends feathers_sequelize_1.Service {
    constructor(options, app) {
        super(options);
        if (app)
            console.log(app);
    }
    create(data, params) {
        const { email, password, githubId } = data;
        const userId = crypto_1.default.createHash('md5').update(email != null ? email.toLowerCase() : githubId).digest('hex');
        const userData = {
            email, password, githubId, userId
        };
        return super.create(userData, params);
    }
}
exports.Users = Users;
