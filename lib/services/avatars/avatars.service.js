"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const avatars_class_1 = require("./avatars.class");
const avatars_model_1 = __importDefault(require("../../models/avatars.model"));
const avatars_hooks_1 = __importDefault(require("./avatars.hooks"));
function default_1(app) {
    const options = {
        Model: avatars_model_1.default(app),
        paginate: app.get('paginate')
    };
    // Initialize our service with any options it requires
    app.use('/avatars', new avatars_class_1.Avatars(options, app));
    // Get our initialized service so that we can register hooks
    const service = app.service('avatars');
    service.hooks(avatars_hooks_1.default);
}
exports.default = default_1;
