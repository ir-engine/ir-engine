import collectAnalytics from '../../hooks/collect-analytics';

import { disallow } from 'feathers-hooks-common';

export default {
  before: {
    all: [collectAnalytics()],
    find: [disallow()],
    get: [disallow()],
    create: [],
    update: [disallow()],
    patch: [disallow()],
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
