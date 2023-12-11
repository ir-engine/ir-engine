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

import { getState } from '@etherealengine/hyperflux'
import { Application } from '@etherealengine/server-core/declarations'
import multiLogger from '@etherealengine/server-core/src/ServerLogger'

import { AuthError, AuthTask } from '@etherealengine/engine/src/networking/functions/receiveJoinWorld'
import { instancePath } from '@etherealengine/engine/src/schemas/networking/instance.schema'
import { identityProviderPath } from '@etherealengine/engine/src/schemas/user/identity-provider.schema'
import { UserID, UserType, userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { InstanceServerState } from './InstanceServerState'
import { authorizeUserToJoinServer, handleConnectingPeer, handleDisconnect } from './NetworkFunctions'
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
      if (getState(InstanceServerState).ready) {
        clearInterval(interval)
        resolve()
      }
    }, 100)
  })

  const network = getServerNetwork(app)

  const onAuthenticationRequest = async (data) => {
    const peerID = data.peerID

    if (authTask) return

    // start a new auth task and let the client know it's pending.
    // the client will have to keep polling us for the status of the task
    // until it is resolved
    authTask = { status: 'pending' }
    spark.write(authTask)
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
      userId = authResult[identityProviderPath].userId as UserID
      user = await app.service(userPath).get(userId, { headers: spark.headers })

      if (!user) {
        authTask.status = 'fail'
        authTask.error = AuthError.USER_NOT_FOUND
        logger.error('[MessageTypes.Authorization]: user %s not found over peer %s %o', userId, peerID, authTask)
        return
      }

      // Check that this use is allowed on this instance
      const instance = await app.service(instancePath).get(getState(InstanceServerState).instance.id)
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

      const connectionData = handleConnectingPeer(network, spark, peerID, user, data.inviteCode)

      spark.write({
        ...connectionData,
        status: 'success'
      })

      spark.off('data', onAuthenticationRequest)

      spark.on('end', () => {
        console.log('got disconnection')
        handleDisconnect(network, peerID)
      })

      spark.on('data', (message) => {
        network.transport.onMessage(peerID, message)
      })
    } catch (e) {
      console.error(e)
      authTask.status = 'fail'
      authTask.error = AuthError.INTERNAL_ERROR
      logger.error('[MessageTypes.Authorization]: internal error while authorizing peer %s', peerID, e.message)
      return
    }

    logger.info('[MessageTypes.Authorization]: user %s successfully authorized for peer %s', userId, peerID)
    authTask.status = 'success'
  }

  spark.on('data', onAuthenticationRequest)
}
