import { HookContext } from '@feathersjs/feathers'
import config from '../appconfig'
import { scopeTypeSeed } from '../scope/scope-type/scope-type.seed'
import { UnauthorizedException, NotFoundException, UnauthenticatedException } from '../util/exceptions/exception'
import { extractLoggedInUserFromParams } from '../user/auth-management/auth-management.utils'

export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    const foundItem = await (context.app.service('scope') as any).Model.findAll({
      where: {
        userId: context.arguments[0]
      }
    })
    if (!foundItem.length) {
      if (context.arguments[1].userRole && context.arguments[1].userRole !== 'admin') {
        config.scopes.user.forEach(async (el) => {
          await context.app.service('scope').create({
            type: el,
            userId: context.arguments[0]
          })
        })
      }

      if (context.arguments[1].userRole === 'admin') {
        scopeTypeSeed.templates.forEach(async (el) => {
          await context.app.service('scope').create({
            type: el.type,
            userId: context.arguments[0]
          })
        })
      }

      if (context.arguments[1]?.scopeTypes) {
        context.arguments[1]?.scopeTypes?.forEach(async (el) => {
          await context.app.service('scope').create({
            type: el.type,
            userId: context.arguments[0]
          })
        })
      }
    } else {
      if (context.arguments[1].userRole && context.arguments[1].userRole !== 'admin') {
        const user = await (context.app.service('user') as any).Model.findOne({
          where: { id: context.arguments[0] }
        })

        if (user?.dataValues?.userRole === 'admin') {
          foundItem.forEach(async (scp) => {
            if (!config.scopes.user.includes(scp.dataValues.type)) {
              await context.app.service('scope').remove(scp.dataValues.id)
            }
          })
        }
      }

      if (context.arguments[1].userRole === 'admin') {
        foundItem.forEach(async (scp) => {
          await context.app.service('scope').remove(scp.dataValues.id)
        })
        scopeTypeSeed.templates.forEach(async (el) => {
          await context.app.service('scope').create({
            type: el.type,
            userId: context.arguments[0]
          })
        })
      }

      if (context.arguments[1].scopeTypes) {
        foundItem.forEach(async (scp) => {
          await context.app.service('scope').remove(scp.dataValues.id)
        })
        context.arguments[1]?.scopeTypes?.forEach(async (el) => {
          await context.app.service('scope').create({
            type: el.type,
            userId: context.arguments[0]
          })
        })
      }
    }
    return context
  }
}
