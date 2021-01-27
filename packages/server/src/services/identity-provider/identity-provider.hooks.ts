import * as feathersAuthentication from '@feathersjs/authentication';
import { hooks } from '@feathersjs/authentication-local';
import { iff, isProvider, preventChanges } from 'feathers-hooks-common';
import accountService from '../auth-management/auth-management.notifier';
import { HookContext } from '@feathersjs/feathers';

const verifyHooks = require('feathers-authentication-management').hooks;
const { authenticate } = feathersAuthentication.hooks;
const hashPassword = hooks.hashPassword;

const { protect } = hooks;

const isPasswordAccountType = () => {
  return (context: HookContext): boolean => {
    if (context.data.type === 'password') {
      return true;
    }
    return false;
  };
};

const sendVerifyEmail = () => {
  return (context: any): Promise<HookContext> => {
    accountService(context.app).notifier('resendVerifySignup', context.result);
    return context;
  };
};

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      iff(
        isPasswordAccountType(),
        hashPassword('password'),
        verifyHooks.addVerification()
      )
    ],
    update: [
      iff(
        isPasswordAccountType(),
        hashPassword('password')
      ),
      authenticate('jwt')
    ],
    patch: [], // hashPassword('password'), authenticate('jwt')
    remove: [] // authenticate('jwt')
  },

  after: {
    all: [
      protect('password')
    ],
    find: [],
    get: [],
    create: [
      sendVerifyEmail()
    ],
    update: [],
    patch: [
      iff(
        isProvider('external'),
        preventChanges(
          true,
          'isVerified',
          'verifyToken',
          'verifyShortToken',
          'verifyExpires',
          'verifyChanges',
          'resetToken',
          'resetShortToken',
          'resetExpires'
        ))
    ],
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
