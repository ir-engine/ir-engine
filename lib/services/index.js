"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_service_1 = __importDefault(require("./users/users.service"));
const scenes_service_1 = __importDefault(require("./scenes/scenes.service"));
const groups_service_1 = __importDefault(require("./groups/groups.service"));
const contacts_service_1 = __importDefault(require("./contacts/contacts.service"));
const instances_service_1 = __importDefault(require("./instances/instances.service"));
const xr_avatars_service_1 = __importDefault(require("./xr-avatars/xr-avatars.service"));
const xr_locations_service_1 = __importDefault(require("./xr-locations/xr-locations.service"));
const xr_objects_service_1 = __importDefault(require("./xr-objects/xr-objects.service"));
// Don't remove this comment. It's needed to format import lines nicely.
function default_1(app) {
    app.configure(users_service_1.default);
    app.configure(scenes_service_1.default);
    app.configure(groups_service_1.default);
    app.configure(contacts_service_1.default);
    app.configure(instances_service_1.default);
    app.configure(xr_avatars_service_1.default);
    app.configure(xr_locations_service_1.default);
    app.configure(xr_objects_service_1.default);
}
exports.default = default_1;
