import { HookContext } from '@feathersjs/feathers'

import { Application } from './../../declarations'

export default () => {
  return async (context: HookContext<Application>): Promise<HookContext> => {
    if (context.arguments[1]?.scopes || Array.isArray(context.arguments[1].scope)) {
      const foundItem = await context.app.service('scope').Model.findAll({
        where: {
          userId: context.arguments[0]
        }
      })

      if (foundItem.length > 0) {
        foundItem.forEach(async (scp) => {
          try {
            await context.app.service('scope').remove(scp.id)
          } catch {}
        })
      }

      const data = context.arguments[1].scopes.map((el) => {
        return {
          type: el.type,
          userId: context.arguments[0]
        }
      })
      if (data.length > 0) await context.app.service('scope').create(data)
    }

    return context
  }
}
