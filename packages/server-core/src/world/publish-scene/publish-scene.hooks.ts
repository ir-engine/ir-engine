import * as authentication from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common'
import { HookContext } from '@feathersjs/feathers'
import attachOwnerIdInSavingContact from '@xrengine/server-core/src/hooks/set-loggedin-user-in-body'
import setResponseStatusCode from '@xrengine/server-core/src/hooks/set-response-status-code'
import mapProjectIdToQuery from '@xrengine/server-core/src/hooks/set-project-id-in-query'
import generateSceneCollection from '../scene/generate-collection.hook'

const { authenticate } = authentication.hooks
const mapProjectSceneDataForSaving = () => {
  return (context: HookContext): HookContext => {
    context.data = {
      ...context.data,
      ...context.data.scene,
      modelOwnedFileId: context.data.scene.model_file_id,
      screenshotOwnedFileId: context.data.scene.screenshot_file_id,
      ownedFileId: context.data.scene.id
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
      attachOwnerIdInSavingContact('ownerUserId'),
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
} as any
