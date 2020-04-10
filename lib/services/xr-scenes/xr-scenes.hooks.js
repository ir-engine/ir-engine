"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authentication = __importStar(require("@feathersjs/authentication"));
const limit_user_id_1 = __importDefault(require("../../hooks/limit-user-id"));
const set_user_id_1 = __importDefault(require("../../hooks/set-user-id"));
// Don't remove this comment. It's needed to format import lines nicely.
const { authenticate } = authentication.hooks;
function addObjects(context) {
}
exports.default = {
    before: {
        all: [authenticate('jwt')],
        find: [limit_user_id_1.default],
        get: [limit_user_id_1.default],
        create: [set_user_id_1.default, addObjects],
        update: [limit_user_id_1.default],
        patch: [limit_user_id_1.default],
        remove: [limit_user_id_1.default]
    },
    after: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    },
    error: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    }
};
