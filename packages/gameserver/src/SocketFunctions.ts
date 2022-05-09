import { Socket } from 'socket.io'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { accessEngineState, EngineActions } from '@xrengine/engine/src/ecs/classes/EngineService'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { matchActionOnce } from '@xrengine/engine/src/networking/functions/matchActionOnce'
import logger from '@xrengine/server-core/src/logger'
import { WebRtcTransportParams } from '@xrengine/server-core/src/types/WebRtcTransportParams'

import {
  handleConnectToWorld,
  handleDisconnect,
  handleHeartbeat,
  handleIncomingActions,
  handleJoinWorld,
  handleLeaveWorld
} from './NetworkFunctions'
import { SocketWebRTCServerTransport } from './SocketWebRTCServerTransport'
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
  handleWebRtcRequestNearbyUsers,
  handleWebRtcResumeConsumer,
  handleWebRtcResumeProducer,
  handleWebRtcSendTrack,
  handleWebRtcTransportClose,
  handleWebRtcTransportConnect,
  handleWebRtcTransportCreate
} from './WebRTCFunctions'

export const setupSocketFunctions = (transport: SocketWebRTCServerTransport) => async (socket: Socket) => {
  const app = transport.app

  if (!accessEngineState().joinedWorld.value)
    await new Promise((resolve) => matchActionOnce(Engine.instance.store, EngineActions.joinedWorld.matches, resolve))

  logger.info('initialized new socket connection with id', socket.id)

  /**
   * Authorize user and make sure everything is valid before allowing them to join the world
   **/
  socket.on(MessageTypes.Authorization.toString(), async (data, callback) => {
    logger.info('[MessageTypes.Authorization]: got auth request for', data.userId)
    const accessToken = data.accessToken

    /**
     * userId or access token were undefined, so something is wrong. Return failure
     */
    if (typeof accessToken === 'undefined' || accessToken === null) {
      callback({ success: false, message: 'accessToken is undefined' })
      return
    }

    const authResult = await app.service('authentication').strategies.jwt.authenticate!(
      { accessToken: accessToken },
      {}
    )
    const userId = authResult['identity-provider'].userId as UserId

    // Check database to verify that user ID is valid
    const user = await app.service('user').Model.findOne({
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

    socket.on(MessageTypes.ConnectToWorld.toString(), async (data, callback) => {
      handleConnectToWorld(transport, socket, data, callback, userId, user)
    })

    socket.on(MessageTypes.JoinWorld.toString(), async (data, callback) =>
      handleJoinWorld(transport, socket, data, callback, userId, user)
    )

    socket.on(MessageTypes.ActionData.toString(), (data) => handleIncomingActions(socket, data))

    socket.on(MessageTypes.Heartbeat.toString(), () => handleHeartbeat(socket))

    socket.on('disconnect', () => handleDisconnect(socket))

    socket.on(MessageTypes.LeaveWorld.toString(), (data, callback) => handleLeaveWorld(socket, data, callback))

    socket.on(MessageTypes.WebRTCTransportCreate.toString(), async (data: WebRtcTransportParams, callback) =>
      handleWebRtcTransportCreate(transport, socket, data, callback)
    )

    socket.on(MessageTypes.WebRTCProduceData.toString(), async (data, callback) =>
      handleWebRtcProduceData(transport, socket, data, callback)
    )

    socket.on(MessageTypes.WebRTCTransportConnect.toString(), async (data, callback) =>
      handleWebRtcTransportConnect(socket, data, callback)
    )

    socket.on(MessageTypes.WebRTCTransportClose.toString(), async (data, callback) =>
      handleWebRtcTransportClose(socket, data, callback)
    )

    socket.on(MessageTypes.WebRTCCloseProducer.toString(), async (data, callback) =>
      handleWebRtcCloseProducer(socket, data, callback)
    )

    socket.on(MessageTypes.WebRTCSendTrack.toString(), async (data, callback) =>
      handleWebRtcSendTrack(transport, socket, data, callback)
    )

    socket.on(MessageTypes.WebRTCReceiveTrack.toString(), async (data, callback) =>
      handleWebRtcReceiveTrack(transport, socket, data, callback)
    )

    socket.on(MessageTypes.WebRTCPauseConsumer.toString(), async (data, callback) =>
      handleWebRtcPauseConsumer(socket, data, callback)
    )

    socket.on(MessageTypes.WebRTCResumeConsumer.toString(), async (data, callback) =>
      handleWebRtcResumeConsumer(socket, data, callback)
    )

    socket.on(MessageTypes.WebRTCCloseConsumer.toString(), async (data, callback) =>
      handleWebRtcCloseConsumer(socket, data, callback)
    )

    socket.on(MessageTypes.WebRTCConsumerSetLayers.toString(), async (data, callback) =>
      handleWebRtcConsumerSetLayers(socket, data, callback)
    )

    socket.on(MessageTypes.WebRTCResumeProducer.toString(), async (data, callback) =>
      handleWebRtcResumeProducer(socket, data, callback)
    )

    socket.on(MessageTypes.WebRTCPauseProducer.toString(), async (data, callback) =>
      handleWebRtcPauseProducer(socket, data, callback)
    )

    socket.on(MessageTypes.WebRTCRequestNearbyUsers.toString(), async (data, callback) =>
      handleWebRtcRequestNearbyUsers(transport, socket, data, callback)
    )

    socket.on(MessageTypes.WebRTCRequestCurrentProducers.toString(), async (data, callback) =>
      handleWebRtcRequestCurrentProducers(socket, data, callback)
    )

    socket.on(MessageTypes.InitializeRouter.toString(), async (data, callback) =>
      handleWebRtcInitializeRouter(transport, socket, data, callback)
    )
  })
}
