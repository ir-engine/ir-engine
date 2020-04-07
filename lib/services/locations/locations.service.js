"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const locations_class_1 = require("./locations.class");
const locations_model_1 = __importDefault(require("../../models/locations.model"));
const locations_hooks_1 = __importDefault(require("./locations.hooks"));
function default_1(app) {
    const options = {
        Model: locations_model_1.default(app),
        paginate: app.get('paginate')
    };
    // Initialize our service with any options it requires
    app.use('/locations', new locations_class_1.Locations(options, app));
    // Get our initialized service so that we can register hooks
    const service = app.service('locations');
    service.hooks(locations_hooks_1.default);
}
exports.default = default_1;
