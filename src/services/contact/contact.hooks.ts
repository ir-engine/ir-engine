import * as authentication from '@feathersjs/authentication'
import { HookContext } from '@feathersjs/feathers'

import attachOwnerIdInSavingContact from '../../hooks/set-loggedin-user-in-body'

// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

const getLoggedInUserContacts = () => {
  return (context: HookContext) => {
    // Getting only logged in user contacts
    context.params.query = {
      ...context.params.query,
      owner: context.params.user.userId
    }
    return context
  }
}

const populateContactsAndLimitData = () => {
  return (context: HookContext) => {
    const userModel = context.app.services.user.Model

    // Get only verified contacts
    context.params.sequelize = {
      raw: false,
      include: [
        {
          model: userModel,
          attributes: ['email', 'userId', 'id'],
          as: 'contactDetail',
          where: {
            isVerified: true
          }
        }
      ]
    }
    return context
  }
}

export default {
  before: {
    all: [authenticate('jwt')],
    find: [
      getLoggedInUserContacts(),
      populateContactsAndLimitData()
    ],
    get: [
      getLoggedInUserContacts(),
      populateContactsAndLimitData()
    ],
    create: [attachOwnerIdInSavingContact('owner')],
    update: [attachOwnerIdInSavingContact('owner')],
    patch: [attachOwnerIdInSavingContact('owner')],
    remove: [attachOwnerIdInSavingContact('owner')]
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
}
