import { AuthError } from '@etherealengine/common/src/enums/AuthError'
import { AuthTask } from '@etherealengine/common/src/interfaces/AuthTask'
import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineActions, getEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { MessageTypes } from '@etherealengine/engine/src/networking/enums/MessageTypes'
import { matchActionOnce } from '@etherealengine/engine/src/networking/functions/matchActionOnce'
import { Application } from '@etherealengine/server-core/declarations'
import multiLogger from '@etherealengine/server-core/src/ServerLogger'

import {
  authorizeUserToJoinServer,
  handleConnectingPeer,
  handleDisconnect,
  handleHeartbeat,
  handleIncomingActions,
  handleJoinWorld,
  handleLeaveWorld
} from './NetworkFunctions'
import { getServerNetwork } from './SocketWebRTCServerFunctions'
import {
  handleWebRtcCloseConsumer,
  handleWebRtcCloseProducer,
  handleWebRtcConsumeData,
  handleWebRtcConsumerSetLayers,
  handleWebRtcInitializeRouter,
  handleWebRtcPauseConsumer,
  handleWebRtcPauseProducer,
  handleWebRtcProduceData,
  handleWebRtcReceiveTrack,
  handleWebRtcRequestCurrentProducers,
  handleWebRtcResumeConsumer,
  handleWebRtcResumeProducer,
  handleWebRtcSendTrack,
  handleWebRtcTransportClose,
  handleWebRtcTransportConnect,
  handleWebRtcTransportCreate
} from './WebRTCFunctions'

const logger = multiLogger.child({ component: 'instanceserver:spark' })

export const setupSocketFunctions = async (app: Application, spark: any) => {
  let authTask: AuthTask | undefined

  /**
   * TODO: update this authorization procedure to use https://frontside.com/effection to better handle async flow
   *
   *
   * Authorize user and make sure everything is valid before allowing them to join the world
   **/
  if (!getEngineState().joinedWorld.value)
    await new Promise((resolve) => matchActionOnce(EngineActions.joinedWorld.matches, resolve))

  const network = getServerNetwork(app)

  spark.on('data', async (message) => {
    if (message.type === MessageTypes.Authorization.toString()) {
      const data = message.data
      if (authTask) {
        logger.info('[MessageTypes.Authorization]: sending auth status to spark %s %o', spark.id, authTask)
        spark.write({ type: MessageTypes.Authorization.toString(), data: authTask, id: message.id })
        return
      }

      // start a new auth task and let the client know it's pending.
      // the client will have to keep polling us for the status of the task
      // until it is resolved
      authTask = { status: 'pending' }
      spark.write({ type: MessageTypes.Authorization.toString(), data: authTask, id: message.id })
      logger.info('[MessageTypes.Authorization]: starting authorization for spark %s', spark.id)

      /**
       * userId or access token were undefined, so something is wrong. Return failure
       */
      const accessToken = data.accessToken
      if (!accessToken) {
        authTask.status = 'fail'
        authTask.error = AuthError.MISSING_ACCESS_TOKEN
        logger.error('[MessageTypes.Authorization]: spark is missing access token %s %o', spark.id, authTask)
        return
      }

      let userId: UserId
      let user: UserInterface

      try {
        const authResult = await app.service('authentication').strategies.jwt.authenticate!(
          { accessToken: accessToken },
          {}
        )
        userId = authResult['identity-provider'].userId as UserId
        user = await app.service('user').get(userId)

        if (!user) {
          authTask.status = 'fail'
          authTask.error = AuthError.USER_NOT_FOUND
          logger.error('[MessageTypes.Authorization]: user %s not found over spark %s %o', userId, spark.id, authTask)
          return
        }

        // Check that this use is allowed on this instance
        const instance = await app.service('instance').get(app.instance.id)
        if (!(await authorizeUserToJoinServer(app, instance, userId))) {
          authTask.status = 'fail'
          authTask.error = AuthError.USER_NOT_AUTHORIZED
          logger.error(
            '[MessageTypes.Authorization]: user %s not authorized over spark %s %o',
            userId,
            spark.id,
            authTask
          )
          return
        }

        /**
         * @todo Check that they are supposed to be in this instance
         * @todo Check that token is valid (to prevent users hacking with a manipulated user ID payload)
         * @todo Check if the user is banned
         */

        await handleConnectingPeer(network, spark, user)
      } catch (e) {
        console.error(e)
        authTask.status = 'fail'
        authTask.error = AuthError.INTERNAL_ERROR
        logger.error('[MessageTypes.Authorization]: internal error while authorizing spark %s', spark.id, e.message)
        return
      }

      spark.on('end', () => {
        console.log('got disconnection')
        handleDisconnect(network, spark)
      })

      spark.on('data', async (message) => {
        const { type, data, id } = message
        switch (type) {
          case MessageTypes.JoinWorld.toString():
            handleJoinWorld(network, spark, data, id, userId, user)
            break
          case MessageTypes.Heartbeat.toString():
            handleHeartbeat(network, spark)
            break
          case MessageTypes.ActionData.toString():
            handleIncomingActions(network, spark, data)
            break
          case MessageTypes.LeaveWorld.toString():
            handleLeaveWorld(network, spark, data, id)
            break
          case MessageTypes.WebRTCTransportCreate.toString():
            handleWebRtcTransportCreate(network, spark, data, id)
            break
          case MessageTypes.WebRTCProduceData.toString():
            handleWebRtcProduceData(network, spark, data, id)
            break
          case MessageTypes.WebRTCConsumeData.toString():
            handleWebRtcConsumeData(network, spark, data, id)
            break
          case MessageTypes.WebRTCTransportConnect.toString():
            handleWebRtcTransportConnect(network, spark, data, id)
            break
          case MessageTypes.WebRTCTransportClose.toString():
            handleWebRtcTransportClose(network, spark, data, id)
            break
          case MessageTypes.WebRTCCloseProducer.toString():
            handleWebRtcCloseProducer(network, spark, data, id)
            break
          case MessageTypes.WebRTCSendTrack.toString():
            handleWebRtcSendTrack(network, spark, data, id)
            break
          case MessageTypes.WebRTCReceiveTrack.toString():
            handleWebRtcReceiveTrack(network, spark, data, id)
            break
          case MessageTypes.WebRTCPauseConsumer.toString():
            handleWebRtcPauseConsumer(network, spark, data, id)
            break
          case MessageTypes.WebRTCResumeConsumer.toString():
            handleWebRtcResumeConsumer(network, spark, data, id)
            break
          case MessageTypes.WebRTCCloseConsumer.toString():
            handleWebRtcCloseConsumer(network, spark, data, id)
            break
          case MessageTypes.WebRTCConsumerSetLayers.toString():
            handleWebRtcConsumerSetLayers(network, spark, data, id)
            break
          case MessageTypes.WebRTCResumeProducer.toString():
            handleWebRtcResumeProducer(network, spark, data, id)
            break
          case MessageTypes.WebRTCPauseProducer.toString():
            handleWebRtcPauseProducer(network, spark, data, id)
            break
          case MessageTypes.WebRTCRequestCurrentProducers.toString():
            handleWebRtcRequestCurrentProducers(network, spark, data, id)
            break
          case MessageTypes.InitializeRouter.toString():
            handleWebRtcInitializeRouter(network, spark, data, id)
            break
        }
      })

      logger.info('[MessageTypes.Authorization]: user %s successfully authorized over spark %s', userId, spark.id)
      authTask.status = 'success'
    }
  })
}
