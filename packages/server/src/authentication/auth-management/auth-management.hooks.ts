import { hooks } from '@feathersjs/authentication';
import { iff } from 'feathers-hooks-common';
import isAction from '../../hooks/is-action';
const { authenticate } = hooks;

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      iff(
        isAction('passwordChange', 'identityChange'),
        authenticate('jwt')
      )
    ],
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
