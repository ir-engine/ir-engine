import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction } from '@xrengine/hyperflux'

export class NetworkConnectionService {
  static actions = {
    noWorldServersAvailable: defineAction({
      store: 'ENGINE',
      type: 'WEBRTC_PROVISION_INSTANCE_NO_GAMESERVERS_AVAILABLE' as const,
      instanceId: matches.string
    }),
    noMediaServersAvailable: defineAction({
      store: 'ENGINE',
      type: 'WEBRTC_PROVISION_CHANNEL_NO_GAMESERVERS_AVAILABLE' as const
    }),
    worldInstanceKicked: defineAction({
      store: 'ENGINE',
      type: 'WEBRTC_INSTANCE_KICKED' as const,
      message: matches.string
    }),
    worldInstanceDisconnected: defineAction({
      store: 'ENGINE',
      type: 'WEBRTC_INSTANCE_DISCONNECTED' as const
    }),
    worldInstanceReconnected: defineAction({
      store: 'ENGINE',
      type: 'WEBRTC_INSTANCE_RECONNECTED' as const
    }),
    mediaInstanceDisconnected: defineAction({
      store: 'ENGINE',
      type: 'WEBRTC_CHANNEL_DISCONNECTED' as const
    }),
    mediaInstanceReconnected: defineAction({
      store: 'ENGINE',
      type: 'WEBRTC_CHANNEL_RECONNECTED' as const
    })
  }
}
