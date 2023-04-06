import { matches } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction } from '@etherealengine/hyperflux'

export class NetworkConnectionService {
  static actions = {
    noWorldServersAvailable: defineAction({
      type: 'ee.client.NetworkConnection.WEBRTC_PROVISION_INSTANCE_NO_INSTANCESERVERS_AVAILABLE' as const,
      instanceId: matches.string
    }),
    noMediaServersAvailable: defineAction({
      type: 'ee.client.NetworkConnection.WEBRTC_PROVISION_CHANNEL_NO_INSTANCESERVERS_AVAILABLE' as const,
      instanceId: matches.string
    }),
    worldInstanceKicked: defineAction({
      type: 'ee.client.NetworkConnection.WEBRTC_INSTANCE_KICKED' as const,
      message: matches.string
    }),
    worldInstanceDisconnected: defineAction({
      type: 'ee.client.NetworkConnection.WEBRTC_INSTANCE_DISCONNECTED' as const
    }),
    worldInstanceReconnected: defineAction({
      type: 'ee.client.NetworkConnection.WEBRTC_INSTANCE_RECONNECTED' as const
    }),
    mediaInstanceDisconnected: defineAction({
      type: 'ee.client.NetworkConnection.WEBRTC_CHANNEL_DISCONNECTED' as const
    }),
    mediaInstanceReconnected: defineAction({
      type: 'ee.client.NetworkConnection.WEBRTC_CHANNEL_RECONNECTED' as const
    })
  }
}
