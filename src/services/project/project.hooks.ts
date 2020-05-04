import { HookContext } from '@feathersjs/feathers';
import * as authentication from '@feathersjs/authentication'
import attachOwnerIdInSavingContact from '../../hooks/set-loggedin-user-in-body'
import setResponseStatusCode from '../../hooks/set-response-status-code'

// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      authenticate('jwt'),
      (context: HookContext) => {
        context.data.project_owned_file_id = context.data.project.project_file_id
        context.data.name = context.data.project.name
        context.data.thumbnail_owned_file_id = context.data.project.thumbnail_file_id
      },
      attachOwnerIdInSavingContact('created_by_account_id')
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      // Spoke is expecting 200, while feather is sending 201 for creation
      setResponseStatusCode(200)
    ],
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
