"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xr_scenes_class_1 = require("./xr-scenes.class");
const xr_scenes_model_1 = __importDefault(require("../../models/xr-scenes.model"));
const xr_scenes_hooks_1 = __importDefault(require("./xr-scenes.hooks"));
function default_1(app) {
    const options = {
        Model: xr_scenes_model_1.default(app),
        paginate: app.get('paginate')
    };
    // Initialize our service with any options it requires
    app.use('/scenes', new xr_scenes_class_1.XrScenes(options, app));
    // Get our initialized service so that we can register hooks
    const service = app.service('scenes');
    service.hooks(xr_scenes_hooks_1.default);
}
exports.default = default_1;
