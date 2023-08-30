/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Hook, HookContext } from '@feathersjs/feathers'

import { matchInstancePath } from '@etherealengine/engine/src/schemas/matchmaking/match-instance.schema'
import { matchUserPath } from '@etherealengine/engine/src/schemas/matchmaking/match-user.schema'
import { MatchTicketAssignmentType } from '@etherealengine/matchmaking/src/match-ticket-assignment.schema'

import { instanceAuthorizedUserPath } from '@etherealengine/engine/src/schemas/networking/instance-authorized-user.schema'
import { InstanceID } from '@etherealengine/engine/src/schemas/networking/instance.schema'
import { identityProviderPath } from '@etherealengine/engine/src/schemas/user/identity-provider.schema'
import logger from '../ServerLogger'

interface AssignmentResponse extends MatchTicketAssignmentType {
  instanceId: InstanceID
  locationName: string
}

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const app = context.app
    const result: AssignmentResponse = context.result
    const userId = context.params[identityProviderPath]?.userId

    if (!result.connection) {
      // if connection is empty, match is not found yet
      return context
    }

    const matchUserResult = await app.service(matchUserPath).find({
      query: {
        ticketId: context.id,
        $limit: 1
      }
    })

    if (!matchUserResult.data.length) {
      logger.info('match user not found?!')
      return context
    }

    const matchUser = matchUserResult.data[0]
    await app.service(matchUserPath).patch(matchUser.id, {
      connection: result.connection
    })

    let [matchServerInstance] = await app.service(matchInstancePath).find({
      query: {
        connection: result.connection
      }
    })

    if (!matchServerInstance) {
      // try to create server instance, ignore error and try to search again, possibly someone just created same server
      try {
        matchServerInstance = await app.service(matchInstancePath).create({
          connection: result.connection,
          gameMode: matchUser.gameMode
        })
      } catch (e) {
        logger.error(`Failed to create new ${matchInstancePath}`)
        const isConnectionDuplicateError =
          e.errors?.[0]?.type === 'unique violation' && e.errors?.[0]?.path === 'connection'
        if (!isConnectionDuplicateError) {
          // ignore only duplicate error
          throw e
        }
        logger.warn('^-- Server instance probably exists but not provisioned: ' + matchServerInstance)
      }
    } else {
      logger.info('Server instance probably exists but not provisioned: ' + matchServerInstance)
    }

    if (!matchServerInstance?.instanceServer) {
      for (let i = 0; i < 20 && !matchServerInstance?.instanceServer; i++) {
        // retry search
        await new Promise((resolve) => setTimeout(resolve, 10))
        matchServerInstance = (
          await app.service(matchInstancePath).find({
            query: {
              connection: result.connection
            }
          })
        )[0]
      }
    }
    if (!matchServerInstance?.instanceServer) {
      // say that no connection yet, on next query it will have instanceServer and same connection
      logger.info('Failed to find provisioned server. Need to retry again.')
      result.connection = ''
      return context
    }

    // add user to server instance
    const existingInstanceAuthorizedUser = await app.service(instanceAuthorizedUserPath).find({
      query: {
        userId: userId,
        instanceId: matchServerInstance.instanceServer,
        $limit: 0
      }
    })
    if (existingInstanceAuthorizedUser.total === 0) {
      await app.service(instanceAuthorizedUserPath).create({
        userId: userId,
        instanceId: matchServerInstance.instanceServer
      })
    }

    result.instanceId = matchServerInstance.instanceServer
    result.locationName = 'game-' + matchServerInstance.gameMode

    return context
  }
}
