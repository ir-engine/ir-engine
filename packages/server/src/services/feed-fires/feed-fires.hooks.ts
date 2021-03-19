// import { HookContext } from "@feathersjs/feathers";
// import logger from "../../app/logger";
import { addFeedFire, removeFeedFire } from "../../hooks/notifications";

export default {
  before: {
    all: [],
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
    create: [addFeedFire],
    update: [],
    patch: [],
    remove: [removeFeedFire]
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
