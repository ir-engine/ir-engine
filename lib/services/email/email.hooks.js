"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feathers_hooks_common_1 = require("feathers-hooks-common");
exports.default = {
    before: {
        all: [feathers_hooks_common_1.disallow('external')],
        find: [],
        get: [],
        create: [],
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
