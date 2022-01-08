import { Hook, HookContext } from '@feathersjs/feathers'

import { OpenMatchTicketAssignment } from '@xrengine/matchmaking/src/interfaces'

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const app = context.app
    const result: OpenMatchTicketAssignment = context.result

    const matchUserResult = await app.service('match-user').find({
      query: {
        ticketId: context.id,
        $limit: 1
      }
    })

    if (!matchUserResult.data.length) {
      console.log('ticket assignment result', result)
      await app.service('match-user').patch(matchUserResult.data[0].id, { connection: result.connection })
    }

    return context
  }
}
