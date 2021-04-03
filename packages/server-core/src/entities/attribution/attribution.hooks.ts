// Don't remove this comment. It's needed to format import lines nicely.
import collectAnalytics from '@xr3ngine/server-core/src/hooks/collect-analytics';

export default {
  before: {
    all: [collectAnalytics()],
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
