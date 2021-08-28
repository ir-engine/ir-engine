import { HookContext } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../user/auth-management/auth-management.utils'

export default (currentType: string, scopeToVerify: string) => {
  return async (context: HookContext) => {
    const loggedInUser = extractLoggedInUserFromParams(context.params)
    if (!loggedInUser) throw new Error('No logged in user')
    const scopes = await context.app.service('scope').Model.findAll({
      where: {
        userId: loggedInUser.userId
      },
      raw: true,
      nest: true
    })
    if (!scopes) {
      throw new Error('No scope available for the current user.')
    }
    const currentScopes = scopes.reduce((result, sc) => {
      if (sc.type.split(':')[0] === currentType) {
        result.push(sc.type.split(':')[1])
      }
      return result
    }, [])
    if (!currentScopes.includes(scopeToVerify)) throw new Error(`Unauthorised action on ${currentType}`)
    return context
  }
}
