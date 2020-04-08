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
const feathersAuthentication = __importStar(require("@feathersjs/authentication"));
const local = __importStar(require("@feathersjs/authentication-local"));
const commonHooks = __importStar(require("feathers-hooks-common"));
const notifier_1 = __importDefault(require("../auth-management/notifier"));
// Don't remove this comment. It's needed to format import lines nicely.
const verifyHooks = require('feathers-authentication-management').hooks;
const { authenticate } = feathersAuthentication.hooks;
const { hashPassword, protect } = local.hooks;
exports.default = {
    before: {
        all: [],
        find: [authenticate('jwt')],
        get: [authenticate('jwt')],
        create: [
            hashPassword('password'),
            verifyHooks.addVerification()
        ],
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
        create: [
            (context) => {
                notifier_1.default(context.app).notifier('resendVerifySignup', context.result);
            },
            verifyHooks.removeVerification()
        ],
        update: [],
        patch: [
            commonHooks.iff(commonHooks.isProvider('external'), commonHooks.preventChanges(true, 'email', 'isVerified', 'verifyToken', 'verifyShortToken', 'verifyExpires', 'verifyChanges', 'resetToken', 'resetShortToken', 'resetExpires'))
        ],
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
