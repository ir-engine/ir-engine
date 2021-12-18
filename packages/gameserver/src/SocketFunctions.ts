import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { handleNetworkStateUpdate } from '@xrengine/engine/src/networking/functions/updateNetworkState'
import {
  handleConnectToWorld,
  handleDisconnect,
  handleHeartbeat,
  handleIncomingActions,
  handleIncomingMessage,
  handleJoinWorld,
  handleLeaveWorld
} from './NetworkFunctions'
import { WebRtcTransportParams } from '@xrengine/server-core/src/types/WebRtcTransportParams'
import { Socket } from 'socket.io'
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
import { Application } from '@xrengine/server-core/declarations'

function isNullOrUndefined<T>(obj: T | null | undefined): obj is null | undefined {
  return typeof obj === 'undefined' || obj === null
}

export const setupSocketFunctions = (app: Application) => async (socket: Socket) => {
  // Authorize user and make sure everything is valid before allowing them to join the world
  socket.on(MessageTypes.Authorization.toString(), async (data, callback) => {
    console.log('AUTHORIZATION CALL HANDLER', data.userId)
    const userId = data.userId
    const accessToken = data.accessToken

    // userId or access token were undefined, so something is wrong. Return failure
    if (isNullOrUndefined(userId) || isNullOrUndefined(accessToken)) {
      const message = 'userId or accessToken is undefined'
      console.error(message)
      callback({ success: false, message })
      return
    }

    // Check database to verify that user ID is valid
    const user = await (app.service('user') as any).Model.findOne({
      attributes: ['id', 'name', 'instanceId', 'avatarId'],
      where: {
        id: userId
      }
    }).catch((error) => {
      // They weren't found in the dabase, so send the client an error message and return
      callback({ success: false, message: error })
      return console.warn('Failed to authorize user')
    })

    // Check database to verify that user ID is valid
    const avatarResources = await app
      .service('static-resource')
      .find({
        query: {
          $select: ['name', 'url', 'staticResourceType', 'userId'],
          $or: [{ userId: null }, { userId: user.id }],
          name: user.avatarId,
          staticResourceType: {
            $in: ['user-thumbnail', 'avatar']
          }
        }
      })
      .catch((error) => {
        // They weren't found in the database, so send the client an error message and return
        callback({ success: false, message: error })
        return console.warn('User avatar not found')
      })

    const avatar = {
      thumbnailURL: '',
      avatarURL: ''
    } as any
    avatarResources?.data.forEach((a) => {
      if (a.staticResourceType === 'avatar') avatar.avatarURL = a.url
      else avatar.thumbnailURL = a.url
    })

    // TODO: Check that they are supposed to be in this instance
    // TODO: Check that token is valid (to prevent users hacking with a manipulated user ID payload)

    // Return an authorization success message to client
    callback({ success: true })

    socket.on(MessageTypes.ConnectToWorld.toString(), async (data, callback) => {
      // console.log('Got ConnectToWorld:');
      // console.log(data);
      // console.log(userId);
      // console.log("Avatar", avatar)
      handleConnectToWorld(socket, data, callback, userId, user, avatar)
    })

    socket.on(MessageTypes.JoinWorld.toString(), async (data, callback) =>
      handleJoinWorld(socket, data, callback, userId, user)
    )

    socket.on(MessageTypes.ActionData.toString(), (data) => handleIncomingActions(socket, data))

    socket.on(MessageTypes.Heartbeat.toString(), () => handleHeartbeat(socket))

    socket.on('disconnect', () => handleDisconnect(socket))

    socket.on(MessageTypes.LeaveWorld.toString(), (data, callback) => handleLeaveWorld(socket, data, callback))

    socket.on(MessageTypes.WebRTCTransportCreate.toString(), async (data: WebRtcTransportParams, callback) =>
      handleWebRtcTransportCreate(socket, data, callback)
    )

    socket.on(MessageTypes.WebRTCProduceData.toString(), async (data, callback) =>
      handleWebRtcProduceData(socket, data, callback)
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
      handleWebRtcSendTrack(socket, data, callback)
    )

    socket.on(MessageTypes.WebRTCReceiveTrack.toString(), async (data, callback) =>
      handleWebRtcReceiveTrack(socket, data, callback)
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
      handleWebRtcRequestNearbyUsers(socket, data, callback)
    )
    socket.on(MessageTypes.WebRTCRequestCurrentProducers.toString(), async (data, callback) =>
      handleWebRtcRequestCurrentProducers(socket, data, callback)
    )

    socket.on(MessageTypes.UpdateNetworkState.toString(), async (data) => handleNetworkStateUpdate(socket, data, true))

    socket.on(MessageTypes.InitializeRouter.toString(), async (data, callback) =>
      handleWebRtcInitializeRouter(socket, data, callback)
    )
  })
}
