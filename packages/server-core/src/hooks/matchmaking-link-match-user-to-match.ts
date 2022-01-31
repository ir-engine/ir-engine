import { Hook, HookContext } from '@feathersjs/feathers'
import { OpenMatchTicketAssignment } from '@xrengine/matchmaking/src/interfaces'

interface AssignmentResponse extends OpenMatchTicketAssignment {
  instanceId: string
  locationName: string
}

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const app = context.app
    const result: AssignmentResponse = context.result
    const userId = context.params['identity-provider']?.userId

    if (!result.connection) {
      // if connection is empty, match is not found yet
      return context
    }

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

    let [matchServerInstance] = await app.service('match-instance').find({
      query: {
        connection: result.connection
      }
    })

    if (!matchServerInstance) {
      // try to create server instance, ignore error and try to search again, possibly someone just created same server
      try {
        matchServerInstance = await app.service('match-instance').create({
          connection: result.connection,
          gamemode: matchUser.gamemode
        })
      } catch (e) {
        console.log('failed to create new match-instance')
        const isConnectionDuplicateError =
          e.errors?.[0]?.type === 'unique violation' && e.errors?.[0]?.path === 'connection'
        if (!isConnectionDuplicateError) {
          // ignore only duplicate error
          throw e
        }
        console.log('^-- server instance probably exists but not provisioned', matchServerInstance)
      }
    } else {
      console.log('server instance probably exists but not provisioned', matchServerInstance)
    }

    if (!matchServerInstance?.gameserver) {
      for (let i = 0; i < 20 && !matchServerInstance?.gameserver; i++) {
        // retry search
        await new Promise((resolve) => setTimeout(resolve, 10))
        matchServerInstance = (
          await app.service('match-instance').find({
            query: {
              connection: result.connection
            }
          })
        )[0]
      }
    }
    if (!matchServerInstance?.gameserver) {
      // say that no connection yet, on next query it will have gameserver and same connection
      console.log('Failed to find provisioned server. Need to retry again.')
      result.connection = ''
      return context
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
      await app.service('instance-authorized-user').create({
        userId: userId,
        instanceId: matchServerInstance.gameserver
      })
    }

    result.instanceId = matchServerInstance.gameserver
    result.locationName = 'game-' + matchServerInstance.gamemode

    return context
  }
}
