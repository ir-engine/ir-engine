import collectAnalytics from '../../hooks/collect-analytics';
import * as authentication from '@feathersjs/authentication';
import addAssociations from "../../hooks/add-associations";

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [authenticate('jwt'), collectAnalytics()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [
      addAssociations({
        models: [
          {
            model: 'location-ban'
          }
        ]
      })
    ],
    get: [
      addAssociations({
        models: [
          {
            model: 'location-ban'
          }
        ]
      })
    ],
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
