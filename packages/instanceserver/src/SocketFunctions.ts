import { Socket } from 'socket.io'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import multiLogger from '@xrengine/server-core/src/logger'
import { WebRtcTransportParams } from '@xrengine/server-core/src/types/WebRtcTransportParams'

import {
  handleConnectToWorld,
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

  let hasListeners = false
  /**
   * Authorize user and make sure everything is valid before allowing them to join the world
   **/
  socket.on(MessageTypes.Authorization.toString(), async (data, callback) => {
    if (hasListeners) {
      callback({ success: true })
      return
    }

    logger.info('[MessageTypes.Authorization]: got auth request for %s', data.userId)
    const accessToken = data.accessToken

    /**
     * userId or access token were undefined, so something is wrong. Return failure
     */
    if (typeof accessToken === 'undefined' || accessToken === null) {
      callback({ success: false, message: 'accessToken is undefined' })
      return
    }

    const authResult = await network.app.service('authentication').strategies.jwt.authenticate!(
      { accessToken: accessToken },
      {}
    )
    const userId = authResult['identity-provider'].userId as UserId

    // Check database to verify that user ID is valid
    const user = await network.app.service('user').Model.findOne({
      attributes: ['id', 'name', 'instanceId', 'avatarId'],
      where: { id: userId }
    })

    if (!user) {
      callback({ success: false, message: 'user not found' })
      return
    }

    /**
     * @todo Check that they are supposed to be in this instance
     * @todo Check that token is valid (to prevent users hacking with a manipulated user ID payload)
     */

    callback({ success: true })

    hasListeners = true

    socket.on(MessageTypes.ConnectToWorld.toString(), async (data, callback) => {
      handleConnectToWorld(network, socket, data, callback, userId, user)
    })

    socket.on(MessageTypes.JoinWorld.toString(), async (data, callback) =>
      handleJoinWorld(network, socket, data, callback, userId, user)
    )

    socket.on(MessageTypes.ActionData.toString(), (data) => handleIncomingActions(network, socket, data))

    socket.on(MessageTypes.Heartbeat.toString(), () => handleHeartbeat(socket))

    socket.on('disconnect', () => handleDisconnect(network, socket))

    socket.on(MessageTypes.LeaveWorld.toString(), (data, callback) => handleLeaveWorld(network, socket, data, callback))

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
  })
}
