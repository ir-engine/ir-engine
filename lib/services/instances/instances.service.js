"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const instances_class_1 = require("./instances.class");
const instances_model_1 = __importDefault(require("../../models/instances.model"));
const instances_hooks_1 = __importDefault(require("./instances.hooks"));
function default_1(app) {
    const options = {
        Model: instances_model_1.default(app),
        paginate: app.get('paginate')
    };
    // Initialize our service with any options it requires
    app.use('/instances', new instances_class_1.Instances(options, app));
    // Get our initialized service so that we can register hooks
    const service = app.service('instances');
    service.hooks(instances_hooks_1.default);
}
exports.default = default_1;
