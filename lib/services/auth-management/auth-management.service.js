"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notifier_1 = __importDefault(require("./notifier"));
const auth_management_hooks_1 = __importDefault(require("./auth-management.hooks"));
const feathers_authentication_management_1 = __importDefault(require("feathers-authentication-management"));
exports.default = (app) => {
    app.configure(feathers_authentication_management_1.default(notifier_1.default(app)));
    // Get our initialized service so that we can register hooks
    const service = app.service('authManagement');
    service.hooks(auth_management_hooks_1.default);
};
