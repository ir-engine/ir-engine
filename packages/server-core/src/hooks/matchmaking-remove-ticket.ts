import { Hook, HookContext } from '@feathersjs/feathers'

import { matchUserPath } from '@etherealengine/engine/src/schemas/matchmaking/match-user.schema'

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, result } = context
    // no need to check user, if ticket is already deleted - delete corresponding match-user row

    const matchUsersResult = await app.service(matchUserPath).find({
      query: {
        ticketId: result.id
      }
    })

    const matchUserRow = matchUsersResult.data?.[0]

    if (matchUserRow) {
      await app.service(matchUserPath).remove(matchUserRow.id)
    }
    // todo: handle not found here?

    return context
  }
}
