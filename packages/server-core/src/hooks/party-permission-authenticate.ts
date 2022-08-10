import { Forbidden } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'

export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { id, method, params, app } = context
    const user = params.user

    if (method === 'patch' || method === 'remove' || method === 'update') {
      const partyUser = await app.service('party-user').find({
        query: {
          partyId: id,
          userId: user.id
        }
      })
      if (partyUser.total === 0 || !partyUser.data[0].isOwner)
        throw new Forbidden('You are not the owner of this party')
    }

    return context
  }
}
