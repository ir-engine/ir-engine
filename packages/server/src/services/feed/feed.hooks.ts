import addAssociations from "../../hooks/add-associations";
import { HookContext } from "@feathersjs/feathers";
import logger from "../../app/logger";

export default {
  before: {
    all: [],
    find: [
      // addAssociations({
      //   models: [
      //     {
      //       model: 'user'
      //     },
      //     {
      //       model: 'feed_fires'
      //     },
      //   ]
      // })
    ],
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
