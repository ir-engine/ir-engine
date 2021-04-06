// import * as authentication from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common';
import addAttribution from '@xr3ngine/server-core/src/hooks/add-attribution';
// import createResource from '@xr3ngine/server-core/src/hooks/create-resource'
// Don't remove this comment. It's needed to format import lines nicely.

export default {
  before: {
    all: [],
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
    create: [addAttribution],
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
