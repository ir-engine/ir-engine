import * as authentication from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common'
import { HookContext } from '@feathersjs/feathers'
import attachOwnerIdInSavingContact from '../../hooks/set-loggedin-user-in-body'
import setResponseStatusCode from '../../hooks/set-response-status-code'
import mapProjectIdToQuery from '../../hooks/set-project-id-in-query'
import generateSceneCollection from '../project/generate-collection.hook'

const { authenticate } = authentication.hooks
const mapProjectSceneDataForSaving = () => {
  return (context: HookContext) => {
    context.data = {
      ...context.data,
      ...context.data.scene,
      model_owned_file_id: context.data.scene.model_file_id,
      screenshot_owned_file_id: context.data.scene.screenshot_file_id,
      owned_file_id: context.data.scene.scene_file_id
    }
    return context
  }
}

export default {
  before: {
    all: [authenticate('jwt')],
    find: [disallow()],
    get: [disallow()],
    create: [
      attachOwnerIdInSavingContact('account_id'),
      mapProjectSceneDataForSaving(),
      mapProjectIdToQuery(),
      generateSceneCollection({ type: 'scene' })
    ],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [setResponseStatusCode(200)],
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
