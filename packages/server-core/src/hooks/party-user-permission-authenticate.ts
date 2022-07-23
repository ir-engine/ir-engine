import { BadRequest, Forbidden } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'

export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { id, method, params, app } = context
    const user = params.user

    if (method === 'patch' || method === 'remove' || method === 'update') {
      const affectedPartyUser = await app.service('party-user').get(id!.toString())
      if (!affectedPartyUser || !affectedPartyUser.partyId) throw new BadRequest('Invalid party user ID')

      if (affectedPartyUser.userId !== user.id) {
        const partyUser = await app.service('party-user').find({
          query: {
            partyId: affectedPartyUser.partyId,
            userId: user.id
          }
        })
        if (partyUser.total === 0 || !partyUser.data[0].isOwner)
          throw new Forbidden('You are not the owner of this party')
      }
    }

    return context
  }
}
