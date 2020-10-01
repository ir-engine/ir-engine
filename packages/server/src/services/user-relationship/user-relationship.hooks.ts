import * as authentication from '@feathersjs/authentication';
import * as commonHooks from 'feathers-hooks-common';

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [commonHooks.iff(
      commonHooks.isProvider('external'),
      authenticate('jwt')
    )],
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
