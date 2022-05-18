import { HookContext } from '@feathersjs/feathers'

import { UserDataType } from '../user/user/user.class'
import { NotFoundException, UnauthenticatedException, UnauthorizedException } from '../util/exceptions/exception'
import { Application } from './../../declarations.d'

export default (currentType: string, scopeToVerify: string) => {
  return async (context: HookContext<Application>) => {
    if (context.params.isInternal) return context
    const loggedInUser = context.params.user as UserDataType
    if (!loggedInUser) throw new UnauthenticatedException('No logged in user')
    const user = await context.app.service('user').get(loggedInUser.id!)
    if (user.userRole === 'admin') return context
    const scopes = await context.app.service('scope').Model.findAll({
      where: {
        userId: loggedInUser.id
      },
      raw: true,
      nest: true
    })
    if (!scopes) {
      throw new NotFoundException('No scope available for the current user.')
    }
    const currentScopes = scopes.reduce((result, sc) => {
      if (sc.type.split(':')[0] === currentType) {
        result.push(sc.type.split(':')[1])
      }
      return result
    }, [])
    if (!currentScopes.includes(scopeToVerify))
      throw new UnauthorizedException(`Unauthorised ${scopeToVerify} action on ${currentType}`)
    return context
  }
}
