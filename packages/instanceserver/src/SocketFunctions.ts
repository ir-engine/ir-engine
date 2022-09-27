import { Socket } from 'socket.io'

import { AuthError } from '@xrengine/common/src/enums/AuthError'
import { AuthTask } from '@xrengine/common/src/interfaces/AuthTask'
import { UserInterface } from '@xrengine/common/src/interfaces/User'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import multiLogger from '@xrengine/server-core/src/ServerLogger'
import { WebRtcTransportParams } from '@xrengine/server-core/src/types/WebRtcTransportParams'

import {
  authorizeUserToJoinServer,
  disconnectClientIfConnected,
  handleConnectingPeer,
  handleDisconnect,
  handleHeartbeat,
  handleIncomingActions,
  handleJoinWorld,
  handleLeaveWorld
} from './NetworkFunctions'
import { SocketWebRTCServerNetwork } from './SocketWebRTCServerNetwork'
import {
  handleWebRtcCloseConsumer,
  handleWebRtcCloseProducer,
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

const logger = multiLogger.child({ component: 'instanceserver:socket' })

export const setupSocketFunctions = (network: SocketWebRTCServerNetwork, socket: Socket) => {
  logger.info('Initialized new socket connection with id %s', socket.id)

  let authTask: AuthTask | undefined

  /**
   * TODO: update this authorization procedure to use https://frontside.com/effection to better handle async flow
   *
   *
   * Authorize user and make sure everything is valid before allowing them to join the world
   **/
  socket.on(
    MessageTypes.Authorization.toString(),
    async (data: { accessToken: string }, callback: (result: AuthTask) => void) => {
      // if we have already started an auth task, return it's status
      if (authTask) {
        logger.info('[MessageTypes.Authorization]: sending auth status to socket %s %o', socket.id, authTask)
        callback(authTask)
        return
      }

      // start a new auth task and let the client know it's pending.
      // the client will have to keep polling us for the status of the task
      // until it is resolved
      authTask = { status: 'pending' }
      callback(authTask)
      logger.info('[MessageTypes.Authorization]: starting authorization for socket %s', socket.id)

      /**
       * userId or access token were undefined, so something is wrong. Return failure
       */
      const accessToken = data.accessToken
      if (!accessToken) {
        authTask.status = 'fail'
        authTask.error = AuthError.MISSING_ACCESS_TOKEN
        logger.error('[MessageTypes.Authorization]: socket is missing access token %s %o', socket.id, authTask)
        return
      }

      let userId: UserId
      let user: UserInterface

      try {
        const authResult = await network.app.service('authentication').strategies.jwt.authenticate!(
          { accessToken: accessToken },
          {}
        )
        userId = authResult['identity-provider'].userId as UserId
        user = await network.app.service('user').Model.findOne({
          attributes: ['id', 'name', 'instanceId', 'avatarId'],
          where: { id: userId }
        })

        if (!user) {
          authTask.status = 'fail'
          authTask.error = AuthError.USER_NOT_FOUND
          logger.error('[MessageTypes.Authorization]: user %s not found over socket %s %o', userId, socket.id, authTask)
          return
        }

        // Check that this use is allowed on this instance
        const instance = await network.app.service('instance').get(network.app.instance.id)
        if (!(await authorizeUserToJoinServer(network.app, instance, userId))) {
          authTask.status = 'fail'
          authTask.error = AuthError.USER_NOT_AUTHORIZED
          logger.error(
            '[MessageTypes.Authorization]: user %s not authorized over socket %s %o',
            userId,
            socket.id,
            authTask
          )
          return
        }

        /**
         * @todo Check that they are supposed to be in this instance
         * @todo Check that token is valid (to prevent users hacking with a manipulated user ID payload)
         * @todo Check if the user is banned
         */

        disconnectClientIfConnected(network, socket, userId)

        await handleConnectingPeer(network, socket, user)
      } catch (e) {
        authTask.status = 'fail'
        authTask.error = AuthError.INTERNAL_ERROR
        logger.error('[MessageTypes.Authorization]: internal error while authorizing socket %s', socket.id, e.message)
        return
      }

      socket.on(MessageTypes.JoinWorld.toString(), (data, callback) => {
        handleJoinWorld(network, socket, data, callback, userId, user)
      })

      socket.on(MessageTypes.ActionData.toString(), (data) => handleIncomingActions(network, socket, data))

      socket.on(MessageTypes.Heartbeat.toString(), () => handleHeartbeat(network, socket))

      socket.on('disconnect', () => handleDisconnect(network, socket))

      socket.on(MessageTypes.LeaveWorld.toString(), (data, callback) =>
        handleLeaveWorld(network, socket, data, callback)
      )

      socket.on(MessageTypes.WebRTCTransportCreate.toString(), async (data: WebRtcTransportParams, callback) =>
        handleWebRtcTransportCreate(network, socket, data, callback)
      )

      socket.on(MessageTypes.WebRTCProduceData.toString(), async (data, callback) =>
        handleWebRtcProduceData(network, socket, data, callback)
      )

      socket.on(MessageTypes.WebRTCTransportConnect.toString(), async (data, callback) =>
        handleWebRtcTransportConnect(network, socket, data, callback)
      )

      socket.on(MessageTypes.WebRTCTransportClose.toString(), async (data, callback) =>
        handleWebRtcTransportClose(network, socket, data, callback)
      )

      socket.on(MessageTypes.WebRTCCloseProducer.toString(), async (data, callback) =>
        handleWebRtcCloseProducer(network, socket, data, callback)
      )

      socket.on(MessageTypes.WebRTCSendTrack.toString(), async (data, callback) =>
        handleWebRtcSendTrack(network, socket, data, callback)
      )

      socket.on(MessageTypes.WebRTCReceiveTrack.toString(), async (data, callback) =>
        handleWebRtcReceiveTrack(network, socket, data, callback)
      )

      socket.on(MessageTypes.WebRTCPauseConsumer.toString(), async (data, callback) =>
        handleWebRtcPauseConsumer(network, socket, data, callback)
      )

      socket.on(MessageTypes.WebRTCResumeConsumer.toString(), async (data, callback) =>
        handleWebRtcResumeConsumer(network, socket, data, callback)
      )

      socket.on(MessageTypes.WebRTCCloseConsumer.toString(), async (data, callback) =>
        handleWebRtcCloseConsumer(network, socket, data, callback)
      )

      socket.on(MessageTypes.WebRTCConsumerSetLayers.toString(), async (data, callback) =>
        handleWebRtcConsumerSetLayers(network, socket, data, callback)
      )

      socket.on(MessageTypes.WebRTCResumeProducer.toString(), async (data, callback) =>
        handleWebRtcResumeProducer(network, socket, data, callback)
      )

      socket.on(MessageTypes.WebRTCPauseProducer.toString(), async (data, callback) =>
        handleWebRtcPauseProducer(network, socket, data, callback)
      )

      socket.on(MessageTypes.WebRTCRequestCurrentProducers.toString(), async (data, callback) =>
        handleWebRtcRequestCurrentProducers(network, socket, data, callback)
      )

      socket.on(MessageTypes.InitializeRouter.toString(), async (data, callback) =>
        handleWebRtcInitializeRouter(network, socket, data, callback)
      )

      logger.info('[MessageTypes.Authorization]: user %s successfully authorized over socket %s', userId, socket.id)
      authTask.status = 'success'
    }
  )
}
