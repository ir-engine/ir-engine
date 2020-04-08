"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notifier_1 = __importDefault(require("./notifier"));
const authmanagement_hooks_1 = __importDefault(require("./authmanagement.hooks"));
const authManagement = require('feathers-authentication-management');
function default_1(app) {
    console.log('.................', authManagement, notifier_1.default);
    app.configure(authManagement(notifier_1.default(app)));
    // Get our initialized service so that we can register hooks
    const service = app.service('authManagement');
    console.log('.......service........', service);
    service.hooks(authmanagement_hooks_1.default);
}
exports.default = default_1;
