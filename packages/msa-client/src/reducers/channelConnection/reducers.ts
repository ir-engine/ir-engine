import {
  CHANNEL_SERVER_PROVISIONING,
  CHANNEL_SERVER_PROVISIONED,
  CHANNEL_SERVER_CONNECTING,
  CHANNEL_SERVER_CONNECTED,
  CHANNEL_SERVER_DISCONNECTED,
  SOCKET_CREATED
} from '../actions'
import Immutable from 'immutable'
import { ChannelServerAction, ChannelServerProvisionedAction } from './actions'
import { SocketCreatedAction } from '../common/SocketCreatedAction'

export const initialChannelConnectionState = {
  instance: {
    ipAddress: '',
    port: ''
  },
  socket: {},
  locationId: '',
  sceneId: '',
  channelId: '',
  instanceProvisioned: false,
  connected: false,
  readyToConnect: false,
  updateNeeded: false,
  instanceServerConnecting: false,
  instanceProvisioning: false
}

let connectionSocket = null

const immutableState = Immutable.fromJS(initialChannelConnectionState) as any

const channelConnectionReducer = (state = immutableState, action: ChannelServerAction): any => {
  let newValues, newInstance, newClient
  switch (action.type) {
    case CHANNEL_SERVER_PROVISIONING:
      return state
        .set('instance', new Map(Object.entries(initialChannelConnectionState.instance)))
        .set('socket', {})
        .set('connected', false)
        .set('instanceProvisioned', false)
        .set('readyToConnect', false)
        .set('instanceProvisioning', true)
    case CHANNEL_SERVER_PROVISIONED:
      newInstance = new Map(state.get('instance'))
      newValues = action as ChannelServerProvisionedAction
      newInstance.set('ipAddress', newValues.ipAddress)
      newInstance.set('port', newValues.port)
      return state
        .set('instance', newInstance)
        .set('channelId', newValues.channelId)
        .set('instanceProvisioning', false)
        .set('instanceProvisioned', true)
        .set('readyToConnect', true)
        .set('updateNeeded', true)
        .set('connected', false)
    case CHANNEL_SERVER_CONNECTING:
      return state.set('instanceServerConnecting', true)
    case CHANNEL_SERVER_CONNECTED:
      return state
        .set('connected', true)
        .set('instanceServerConnecting', false)
        .set('updateNeeded', false)
        .set('readyToConnect', false)
    case CHANNEL_SERVER_DISCONNECTED:
      if (connectionSocket != null) (connectionSocket as any).close()
      return state
        .set('connected', initialChannelConnectionState.connected)
        .set('instanceServerConnecting', initialChannelConnectionState.instanceServerConnecting)
        .set('instanceProvisioning', initialChannelConnectionState.instanceProvisioning)
        .set('instanceProvisioned', initialChannelConnectionState.instanceProvisioned)
        .set('readyToConnect', initialChannelConnectionState.readyToConnect)
        .set('updateNeeded', initialChannelConnectionState.updateNeeded)
        .set('instance', new Map(Object.entries(initialChannelConnectionState.instance)))
        .set('locationId', initialChannelConnectionState.locationId)
        .set('sceneId', initialChannelConnectionState.sceneId)
        .set('channelId', initialChannelConnectionState.channelId)
    case SOCKET_CREATED:
      if (connectionSocket != null) (connectionSocket as any).close()
      connectionSocket = (action as SocketCreatedAction).socket
      return state
  }

  return state
}

export default channelConnectionReducer
