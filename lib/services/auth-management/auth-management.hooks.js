"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const authentication = __importStar(require("@feathersjs/authentication"));
const commonHooks = __importStar(require("feathers-hooks-common"));
const { authenticate } = authentication.hooks;
const isAction = (...params) => {
    let args = Array.from(params);
    return (hook) => args.includes(hook.data.action);
};
exports.default = {
    before: {
        all: [],
        find: [],
        get: [],
        create: [
            commonHooks.iff(isAction('passwordChange', 'identityChange'), authenticate('jwt'))
        ],
        update: [],
        patch: [],
        remove: []
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
