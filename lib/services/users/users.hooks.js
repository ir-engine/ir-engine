"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const feathersAuthentication = __importStar(require("@feathersjs/authentication"));
const local = __importStar(require("@feathersjs/authentication-local"));
// Don't remove this comment. It's needed to format import lines nicely.
const { authenticate } = feathersAuthentication.hooks;
const { hashPassword, protect } = local.hooks;
exports.default = {
    before: {
        all: [],
        find: [authenticate('jwt')],
        get: [authenticate('jwt')],
        create: [hashPassword('password')],
        update: [hashPassword('password'), authenticate('jwt')],
        patch: [hashPassword('password'), authenticate('jwt')],
        remove: [authenticate('jwt')]
    },
    after: {
        all: [
            // Make sure the password field is never sent to the client
            // Always must be the last hook
            protect('password')
        ],
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
