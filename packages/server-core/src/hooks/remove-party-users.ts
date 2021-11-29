import { HookContext } from '@feathersjs/feathers'
import _ from 'lodash'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    // Getting logged in user and attaching owner of user
    const { id, app, params } = context
    const partyUserResult = await app.service('party-user').find({
      query: {
        partyId: id || params.query?.partyId,
        $limit: 10000
      }
    })
    delete params.query!.partyId
    params.partyUsersRemoved = true
    await Promise.all(
      partyUserResult.data.map((partyUser) => {
        const paramsCopy = _.cloneDeep(params)
        paramsCopy.query!.partyId = id
        paramsCopy.query!.userId = partyUser.userId
        return app.service('party-user').remove(partyUser.id, paramsCopy)
      })
    )

    return context
  }
}
