"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const groups_class_1 = require("./groups.class");
const groups_model_1 = __importDefault(require("../../models/groups.model"));
const groups_hooks_1 = __importDefault(require("./groups.hooks"));
function default_1(app) {
    const options = {
        Model: groups_model_1.default(app),
        paginate: app.get('paginate')
    };
    // Initialize our service with any options it requires
    app.use('/groups', new groups_class_1.Groups(options, app));
    // Get our initialized service so that we can register hooks
    const service = app.service('groups');
    service.hooks(groups_hooks_1.default);
}
exports.default = default_1;
