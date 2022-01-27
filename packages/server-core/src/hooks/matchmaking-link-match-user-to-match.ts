import { Hook, HookContext } from '@feathersjs/feathers'
import { OpenMatchTicketAssignment } from '@xrengine/matchmaking/src/interfaces'

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const app = context.app
    const result: OpenMatchTicketAssignment = context.result
    const userId = context.params['identity-provider']?.userId

    console.log(
      '! --- link match-user to match -- for ticket:%s, user: %s, connection: %s',
      context.id,
      userId,
      result.connection
    )
    if (!result.connection) {
      return context
    }

    console.log(`!!! --- !!! --- save connection and instance -- for ticket [${context.id}]`)
    console.log('connection', result.connection)

    const matchUserResult = await app.service('match-user').find({
      query: {
        ticketId: context.id,
        $limit: 1
      }
    })

    if (!matchUserResult.data.length) {
      console.log('match user not found?!')
      return context
    }

    const matchUser = matchUserResult.data[0]

    await app.service('match-user').patch(matchUser.id, {
      connection: result.connection
    })

    console.log('ticket assignment result', result)
    let [matchServerInstance] = await app.service('match-instance').find({
      query: {
        connection: result.connection
      }
    })
    console.log('matchServerInstance0', matchServerInstance)

    if (!matchServerInstance) {
      console.log('INSTANCE NOT FOUND')
      console.log('create matchServerInstance')
      try {
        matchServerInstance = await app.service('match-instance').create(
          {
            connection: result.connection,
            gamemode: matchUser.gamemode
          },
          context.params
        )
        console.log('matchServerInstance', matchServerInstance)
      } catch (e) {
        // console.error('Failed to create match-instance')
        // throw e
      }
    }

    if (!matchServerInstance?.gameserver) {
      // TODO: make loop?
      for (let i = 0; i < 10 && !matchServerInstance?.gameserver; i++) {
        // retry search
        await new Promise((resolve) => setTimeout(resolve, 10))
        matchServerInstance = (
          await app.service('match-instance').find({
            query: {
              connection: result.connection
            }
          })
        )[0]
        console.log('matchServerInstance2', matchServerInstance)
      }
    }

    // add user to server instance
    const existingInstanceAuthorizedUser = await app.service('instance-authorized-user').find({
      query: {
        userId: userId,
        instanceId: matchServerInstance.gameserver,
        $limit: 0
      }
    })
    if (existingInstanceAuthorizedUser.total === 0) {
      console.log('instance-authorized-user.create', {
        userId: userId,
        instanceId: matchServerInstance.gameserver
      })
      await app.service('instance-authorized-user').create({
        userId: userId,
        instanceId: matchServerInstance.gameserver
      })
    }

    return context
  }
}
