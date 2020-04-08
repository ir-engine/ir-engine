"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xr_locations_class_1 = require("./xr-locations.class");
const xr_locations_model_1 = __importDefault(require("../../models/xr-locations.model"));
const xr_locations_hooks_1 = __importDefault(require("./xr-locations.hooks"));
function default_1(app) {
    const options = {
        Model: xr_locations_model_1.default(app),
        paginate: app.get('paginate')
    };
    // Initialize our service with any options it requires
    app.use('/locations', new xr_locations_class_1.XrLocations(options, app));
    // Get our initialized service so that we can register hooks
    const service = app.service('locations');
    service.hooks(xr_locations_hooks_1.default);
}
exports.default = default_1;
