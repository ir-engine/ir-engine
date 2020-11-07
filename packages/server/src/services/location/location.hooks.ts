import collectAnalytics from '../../hooks/collect-analytics';
import * as authentication from '@feathersjs/authentication';
import addAssociations from "../../hooks/add-associations";

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [authenticate('jwt'), collectAnalytics()],
    find: [
      addAssociations({
        models: [
          {
            model: 'location-ban'
          },
          {
            model: 'location-settings'
          }
        ]
      }),
      (context) => console.log(context.params.sequelize.include)
    ],
    get: [
      addAssociations({
        models: [
          {
            model: 'location-ban'
          },
          {
            model: 'location-settings'
          }
        ]
      })
    ],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [(context) => console.log(context.result.data)],
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
