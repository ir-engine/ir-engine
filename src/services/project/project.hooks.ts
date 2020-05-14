import collectAnalytics from '../../hooks/collect-analytics'
import * as authentication from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common'
import { BadRequest } from '@feathersjs/errors'

import { HookContext } from '@feathersjs/feathers'
import setResponseStatusCode from '../../hooks/set-response-status-code'
import attachOwnerIdInBody from '../../hooks/set-loggedin-user-in-body'
import attachOwnerIdInQuery from '../../hooks/set-loggedin-user-in-query'
import mapProjectIdToQuery from '../../hooks/set-project-id-in-query'
import generateSceneCollection from './generate-collection.hook'
// import { extractLoggedInUserFromParams } from '../auth-management/auth-management.utils'
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

const mapProjectSaveData = () => {
  return (context: HookContext) => {
    context.data.owned_file_id = context.data.project.project_file_id
    context.data.name = context.data.project.name
    context.data.thumbnail_file_id = context.data.project.thumbnail_file_id
    return context
  }
}

const validateCollectionData = () => {
  return async (context: HookContext) => {
    if (!context?.data?.owned_file_id || !context?.data?.name || !context?.data?.thumbnail_owned_file_id) {
      return await Promise.reject(new BadRequest('Project Data is required!'))
    }
    return context
  }
}

export default {
  before: {
    all: [authenticate('jwt'), collectAnalytics()],
    find: [],
    get: [],
    create: [attachOwnerIdInBody('created_by_account_id'), mapProjectSaveData(), validateCollectionData(), generateSceneCollection({ type: 'project' })],
    update: [disallow()],
    patch: [attachOwnerIdInBody('created_by_account_id'), mapProjectIdToQuery(), mapProjectSaveData(), validateCollectionData()],
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
