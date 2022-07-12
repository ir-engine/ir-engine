import { HookContext } from '@feathersjs/feathers'

import config from '../appconfig'
import { scopeTypeSeed } from '../scope/scope-type/scope-type.seed'
import { Application } from './../../declarations'

export default () => {
  return async (context: HookContext<Application>): Promise<HookContext> => {
    const foundItem = await context.app.service('scope').find({
      where: {
        userId: context.arguments[0]
      }
    })

    if (foundItem.total) {
      foundItem.data.forEach(async (scp) => {
        try {
          await context.app.service('scope').remove(scp.id)
        } catch {}
      })
    }

    let createData: any = []

    if (context.arguments[1]?.userRole === 'admin') {
      createData = scopeTypeSeed.templates.map((el) => {
        return {
          type: el.type,
          userId: context.arguments[0]
        }
      })
    } else {
      createData = config.scopes.user.map((el) => {
        return {
          type: el,
          userId: context.arguments[0]
        }
      })
    }

    for (const el of context.arguments[1]?.scopes) {
      const dataExists = createData.find((item) => item.type === el.type)
      if (!dataExists) {
        createData.push({
          type: el.type,
          userId: context.arguments[0]
        })
      }
    }

    if (createData.length > 0) {
      await context.app.service('scope').create(createData)
    }

    return context
  }
}
