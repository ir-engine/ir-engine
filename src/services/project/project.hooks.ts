import * as authentication from '@feathersjs/authentication';

import { HookContext } from '@feathersjs/feathers';
import setResponseStatusCode from '../../hooks/set-response-status-code'
import attachOwnerIdInBody from '../../hooks/set-loggedin-user-in-body'
import attachOwnerIdInQuery from '../../hooks/set-loggedin-user-in-query'

// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

const mapProjectSaveData = () => {
  return (context: HookContext) => {
    context.data.project_owned_file_id = context.data.project.project_file_id
    context.data.name = context.data.project.name
    context.data.thumbnail_owned_file_id = context.data.project.thumbnail_file_id
    return context
  }
}

export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [attachOwnerIdInBody('created_by_account_id'), mapProjectSaveData()],
    update: [],
    patch: [attachOwnerIdInBody('created_by_account_id'), mapProjectSaveData()],
    remove: [
      attachOwnerIdInQuery('created_by_account_id')
    ]
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
