import { Hook, HookContext } from '@feathersjs/feathers'

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, result } = context
    // no need to check user, if ticket is already deleted - delete corresponding match-user row

    const matchUsersResult = await app.service('match-user').find({
      query: {
        ticketId: result.id
      }
    })

    const matchUserRow = matchUsersResult.data?.[0]

    if (matchUserRow) {
      await app.service('match-user').remove(matchUserRow.id)
    }
    // todo: handle not found here?

    return context
  }
}
