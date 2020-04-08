"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xr_location_instances_class_1 = require("./xr-location-instances.class");
const xr_location_instances_model_1 = __importDefault(require("../../models/xr-location-instances.model"));
const xr_location_instances_hooks_1 = __importDefault(require("./xr-location-instances.hooks"));
function default_1(app) {
    const options = {
        Model: xr_location_instances_model_1.default(app),
        paginate: app.get('paginate')
    };
    // Initialize our service with any options it requires
    app.use('/instances', new xr_location_instances_class_1.XrLocationInstances(options, app));
    // Get our initialized service so that we can register hooks
    const service = app.service('instances');
    service.hooks(xr_location_instances_hooks_1.default);
}
exports.default = default_1;
