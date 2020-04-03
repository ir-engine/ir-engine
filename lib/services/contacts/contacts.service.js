"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const contacts_class_1 = require("./contacts.class");
const contacts_model_1 = __importDefault(require("../../models/contacts.model"));
const contacts_hooks_1 = __importDefault(require("./contacts.hooks"));
function default_1(app) {
    const options = {
        Model: contacts_model_1.default(app),
        paginate: app.get('paginate')
    };
    // Initialize our service with any options it requires
    app.use('/contacts', new contacts_class_1.Contacts(options, app));
    // Get our initialized service so that we can register hooks
    const service = app.service('contacts');
    service.hooks(contacts_hooks_1.default);
}
exports.default = default_1;
