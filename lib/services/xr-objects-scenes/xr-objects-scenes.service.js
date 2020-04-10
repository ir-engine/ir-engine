"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xr_objects_scenes_class_1 = require("./xr-objects-scenes.class");
const xr_objects_scenes_model_1 = __importDefault(require("../../models/xr-objects-scenes.model"));
const xr_objects_scenes_hooks_1 = __importDefault(require("./xr-objects-scenes.hooks"));
function default_1(app) {
    const options = {
        Model: xr_objects_scenes_model_1.default(app),
        paginate: app.get('paginate')
    };
    // Initialize our service with any options it requires
    app.use('/xr-objects-scenes', new xr_objects_scenes_class_1.XrObjectsScenes(options, app));
    // Get our initialized service so that we can register hooks
    const service = app.service('xr-objects-scenes');
    service.hooks(xr_objects_scenes_hooks_1.default);
}
exports.default = default_1;
