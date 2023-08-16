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

import { AuthError } from '@etherealengine/common/src/enums/AuthError'
import { AuthTask } from '@etherealengine/common/src/interfaces/AuthTask'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { MessageTypes } from '@etherealengine/engine/src/networking/enums/MessageTypes'
import { getState } from '@etherealengine/hyperflux'
import { Application } from '@etherealengine/server-core/declarations'
import multiLogger from '@etherealengine/server-core/src/ServerLogger'

import { UserID, UserType, userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { InstanceServerState } from './InstanceServerState'
import {
  authorizeUserToJoinServer,
  handleConnectingPeer,
  handleDisconnect,
  handleHeartbeat,
  handleIncomingActions,
  handleJoinWorld
} from './NetworkFunctions'
import { getServerNetwork } from './SocketWebRTCServerFunctions'

const logger = multiLogger.child({ component: 'instanceserver:spark' })

export const setupSocketFunctions = async (app: Application, spark: any) => {
  let authTask: AuthTask | undefined

  /**
   * TODO: update this authorization procedure to use https://frontside.com/effection to better handle async flow
   *
   *
   * Authorize user and make sure everything is valid before allowing them to join the world
   **/
  await new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (getState(EngineState).connectedWorld) {
        clearInterval(interval)
        resolve()
      }
    }, 100)
  })

  const network = getServerNetwork(app)

  spark.on('data', async (message) => {
    if (message.type === MessageTypes.Authorization.toString()) {
      const data = message.data
      const peerID = data.peerID

      if (authTask) {
        logger.info('[MessageTypes.Authorization]: sending auth status to peer %s %o', peerID, authTask)
        spark.write({ type: MessageTypes.Authorization.toString(), data: authTask, id: message.id })
        return
      }

      // start a new auth task and let the client know it's pending.
      // the client will have to keep polling us for the status of the task
      // until it is resolved
      authTask = { status: 'pending' }
      spark.write({ type: MessageTypes.Authorization.toString(), data: authTask, id: message.id })
      logger.info('[MessageTypes.Authorization]: starting authorization for peer %s', peerID)

      /**
       * userId or access token were undefined, so something is wrong. Return failure
       */
      const accessToken = data.accessToken
      if (!accessToken) {
        authTask.status = 'fail'
        authTask.error = AuthError.MISSING_ACCESS_TOKEN
        logger.error('[MessageTypes.Authorization]: peer is missing access token %s %o', peerID, authTask)
        return
      }

      let userId: UserID
      let user: UserType

      try {
        const authResult = await app.service('authentication').strategies.jwt.authenticate!(
          { accessToken: accessToken },
          {}
        )
        userId = authResult['identity-provider'].userId as UserID
        user = await app.service(userPath).get(userId)

        if (!user) {
          authTask.status = 'fail'
          authTask.error = AuthError.USER_NOT_FOUND
          logger.error('[MessageTypes.Authorization]: user %s not found over peer %s %o', userId, peerID, authTask)
          return
        }

        // Check that this use is allowed on this instance
        const instance = await app.service('instance').get(getState(InstanceServerState).instance.id)
        if (!(await authorizeUserToJoinServer(app, instance, userId))) {
          authTask.status = 'fail'
          authTask.error = AuthError.USER_NOT_AUTHORIZED
          logger.error('[MessageTypes.Authorization]: user %s not authorized over peer %s %o', userId, peerID, authTask)
          return
        }

        /**
         * @todo Check that they are supposed to be in this instance
         * @todo Check that token is valid (to prevent users hacking with a manipulated user ID payload)
         * @todo Check if the user is banned
         */

        handleConnectingPeer(network, spark, peerID, user)
      } catch (e) {
        console.error(e)
        authTask.status = 'fail'
        authTask.error = AuthError.INTERNAL_ERROR
        logger.error('[MessageTypes.Authorization]: internal error while authorizing peer %s', peerID, e.message)
        return
      }

      spark.on('end', () => {
        console.log('got disconnection')
        handleDisconnect(network, spark, peerID)
      })

      spark.on('data', async (message) => {
        const { type, data, id } = message
        switch (type) {
          case MessageTypes.JoinWorld.toString():
            handleJoinWorld(network, spark, peerID, data, id, userId, user)
            break
          case MessageTypes.Heartbeat.toString():
            handleHeartbeat(network, spark, peerID)
            break
          case MessageTypes.ActionData.toString():
            handleIncomingActions(network, spark, peerID, data)
            break
        }
      })

      logger.info('[MessageTypes.Authorization]: user %s successfully authorized for peer %s', userId, peerID)
      authTask.status = 'success'
    }
  })
}
