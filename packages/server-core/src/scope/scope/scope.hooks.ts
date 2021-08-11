import { HookContext } from '@feathersjs/feathers'
import { disallow } from 'feathers-hooks-common'

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      async (context: HookContext): Promise<HookContext> => {
        await context.app.service('scope-type').Model.create({
          scopeName: context.data.scopeName,
          location: context.data.location,
          scene: context.data.scene,
          static_resource: context.data.static_resource,
          editor: context.data.editor,
          bot: context.data.bot,
          globalAvatars: context.data.globalAvatars
        })
        return context
      }
    ],
    update: [disallow()],
    patch: [disallow()],
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
