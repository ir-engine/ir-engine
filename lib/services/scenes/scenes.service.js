"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const scenes_class_1 = require("./scenes.class");
const scenes_model_1 = __importDefault(require("../../models/scenes.model"));
const scenes_hooks_1 = __importDefault(require("./scenes.hooks"));
function default_1(app) {
    const options = {
        Model: scenes_model_1.default(app),
        paginate: app.get('paginate')
    };
    // Initialize our service with any options it requires
    app.use('/scenes', new scenes_class_1.Scenes(options, app));
    // Get our initialized service so that we can register hooks
    const service = app.service('scenes');
    service.hooks(scenes_hooks_1.default);
}
exports.default = default_1;
