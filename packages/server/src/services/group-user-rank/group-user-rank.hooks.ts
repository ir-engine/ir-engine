import collectAnalytics from '../../hooks/collect-analytics';
import * as authentication from '@feathersjs/authentication';
import { disallow } from "feathers-hooks-common";

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [authenticate('jwt'), collectAnalytics()],
    find: [],
    get: [],
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
