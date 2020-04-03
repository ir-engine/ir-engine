"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const objects_class_1 = require("./objects.class");
const objects_model_1 = __importDefault(require("../../models/objects.model"));
const objects_hooks_1 = __importDefault(require("./objects.hooks"));
function default_1(app) {
    const options = {
        Model: objects_model_1.default(app),
        paginate: app.get('paginate')
    };
    // Initialize our service with any options it requires
    app.use('/objects', new objects_class_1.Objects(options, app));
    // Get our initialized service so that we can register hooks
    const service = app.service('objects');
    service.hooks(objects_hooks_1.default);
}
exports.default = default_1;
