"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_class_1 = require("./users.class");
const users_model_1 = __importDefault(require("../../models/users.model"));
const users_hooks_1 = __importDefault(require("./users.hooks"));
function default_1(app) {
    const options = {
        Model: users_model_1.default(app),
        paginate: app.get('paginate')
    };
    // Initialize our service with any options it requires
    app.use('/users', new users_class_1.Users(options, app));
    // Get our initialized service so that we can register hooks
    const service = app.service('users');
    service.hooks(users_hooks_1.default);
}
exports.default = default_1;
