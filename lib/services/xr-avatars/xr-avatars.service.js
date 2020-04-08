"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xr_avatars_class_1 = require("./xr-avatars.class");
const xr_avatars_model_1 = __importDefault(require("../../models/xr-avatars.model"));
const xr_avatars_hooks_1 = __importDefault(require("./xr-avatars.hooks"));
function default_1(app) {
    const options = {
        Model: xr_avatars_model_1.default(app),
        paginate: app.get('paginate')
    };
    // Initialize our service with any options it requires
    app.use('/avatars', new xr_avatars_class_1.XrAvatars(options, app));
    // Get our initialized service so that we can register hooks
    const service = app.service('avatars');
    service.hooks(xr_avatars_hooks_1.default);
}
exports.default = default_1;
