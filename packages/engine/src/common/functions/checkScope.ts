import { NotFound } from '@feathersjs/errors'
import { Engine } from '../../ecs/classes/Engine'
import { ScopeType, scopePath } from '../../schemas/scope/scope.schema'
import { UserType } from '../../schemas/user/user.schema'

export const checkScope = async (user: UserType, currentType: string, scopeToVerify: string) => {
  const scopes = (await Engine.instance.api.service(scopePath).find({
    query: {
      userId: user.id
    },
    paginate: false
  })) as ScopeType[]
  if (!scopes || scopes.length === 0) throw new NotFound('No scope available for the current user.')

  const currentScopes = scopes.reduce<string[]>((result, sc) => {
    if (sc.type.split(':')[0] === currentType) result.push(sc.type.split(':')[1])
    return result
  }, [])
  if (!currentScopes.includes(scopeToVerify)) {
    return false
  }
  return true
}
