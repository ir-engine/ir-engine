"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xravatars_class_1 = require("./xravatars.class");
const xravatars_model_1 = __importDefault(require("../../models/xravatars.model"));
const xravatars_hooks_1 = __importDefault(require("./xravatars.hooks"));
function default_1(app) {
    const options = {
        Model: xravatars_model_1.default(app),
        paginate: app.get('paginate')
    };
    // Initialize our service with any options it requires
    app.use('/avatars', new xravatars_class_1.XrAvatars(options, app));
    // Get our initialized service so that we can register hooks
    const service = app.service('avatars');
    service.hooks(xravatars_hooks_1.default);
}
exports.default = default_1;
