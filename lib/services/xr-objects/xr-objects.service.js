"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xr_objects_class_1 = require("./xr-objects.class");
const xr_objects_model_1 = __importDefault(require("../../models/xr-objects.model"));
const xr_objects_hooks_1 = __importDefault(require("./xr-objects.hooks"));
function default_1(app) {
    const options = {
        Model: xr_objects_model_1.default(app),
        paginate: app.get('paginate')
    };
    // Initialize our service with any options it requires
    app.use('/objects', new xr_objects_class_1.XrObjects(options, app));
    // Get our initialized service so that we can register hooks
    const service = app.service('objects');
    service.hooks(xr_objects_hooks_1.default);
}
exports.default = default_1;
