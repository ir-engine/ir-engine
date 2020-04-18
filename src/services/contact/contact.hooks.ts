import * as authentication from '@feathersjs/authentication'
import { HookContext } from '@feathersjs/feathers'
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

// This will attach the owner ID in the contact while creating/updating list item
const attachOwnerIdInSavingContact = () => {
  return (context: HookContext): HookContext => {
    // Getting logged in user and attaching owner of user
    const loggedInUser = context.params.user
    context.data = {
      ...context.data,
      owner: loggedInUser.userId
    }

    return context
  }
}

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
    create: [attachOwnerIdInSavingContact()],
    update: [attachOwnerIdInSavingContact()],
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
}
