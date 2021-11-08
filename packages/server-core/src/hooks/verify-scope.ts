import { HookContext } from '@feathersjs/feathers'
import { UnauthorizedException, NotFoundException, UnauthenticatedException } from '../util/exceptions/exception'
import { extractLoggedInUserFromParams } from '../user/auth-management/auth-management.utils'

export default (currentType: string, scopeToVerify: string) => {
  return async (context: HookContext) => {
    if (context.params.isInternal) return context
    const loggedInUser = extractLoggedInUserFromParams(context.params)
    if (!loggedInUser) throw new UnauthenticatedException('No logged in user')
    const user = await context.app.service('user').get(loggedInUser.userId)
    if (user.userRole === 'admin') return context
    const scopes = await (context.app.service('scope') as any).Model.findAll({
      where: {
        userId: loggedInUser.userId
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
