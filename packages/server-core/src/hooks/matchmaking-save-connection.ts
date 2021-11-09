import { Hook, HookContext } from '@feathersjs/feathers'
import { OpenMatchTicketAssignment } from "@xrengine/engine/tests/mathmaker/interfaces";

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const app = context.app
    const result:OpenMatchTicketAssignment = context.result
    console.log('HOOK! save connection', result)

    const matchUserResult = await app.service('match-user').find({
      query: {
        ticketId: context.id,
        $limit: 1
      }
    })

    if (!matchUserResult.data.length) {
      console.log('HOOK! save connection', matchUserResult.data[0].id, result.connection)
      await app.service('match-user').patch(matchUserResult.data[0].id, { connection: result.connection })
    }

    return context
  }
}
