import Immutable from 'immutable'
import { InstanceServerAction, InstanceServerProvisionedAction } from './actions'

import { SocketCreatedAction } from '../common/SocketCreatedAction'

import {
  INSTANCE_SERVER_CONNECTING,
  INSTANCE_SERVER_CONNECTED,
  INSTANCE_SERVER_DISCONNECTED,
  INSTANCE_SERVER_PROVISIONING,
  INSTANCE_SERVER_PROVISIONED,
  SOCKET_CREATED
} from '../actions'

export const initialInstanceConnectionState = {
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

const immutableState = Immutable.fromJS(initialInstanceConnectionState) as any

const instanceConnectionReducer = (state = immutableState, action: InstanceServerAction): any => {
  let newValues, newInstance, newClient
  switch (action.type) {
    case INSTANCE_SERVER_PROVISIONING:
      return state
        .set('instance', new Map(Object.entries(initialInstanceConnectionState.instance)))
        .set('socket', {})
        .set('connected', false)
        .set('instanceProvisioned', false)
        .set('readyToConnect', false)
        .set('instanceProvisioning', true)
    case INSTANCE_SERVER_PROVISIONED:
      newInstance = new Map(state.get('instance'))
      newValues = action as InstanceServerProvisionedAction
      newInstance.set('ipAddress', newValues.ipAddress)
      newInstance.set('port', newValues.port)
      return state
        .set('instance', newInstance)
        .set('locationId', newValues.locationId)
        .set('sceneId', newValues.sceneId)
        .set('instanceProvisioning', false)
        .set('instanceProvisioned', true)
        .set('readyToConnect', true)
        .set('updateNeeded', true)
        .set('connected', false)
    case INSTANCE_SERVER_CONNECTING:
      return state.set('instanceServerConnecting', true)
    case INSTANCE_SERVER_CONNECTED:
      return state
        .set('connected', true)
        .set('instanceServerConnecting', false)
        .set('updateNeeded', false)
        .set('readyToConnect', false)
    case INSTANCE_SERVER_DISCONNECTED:
      if (connectionSocket != null) (connectionSocket as any).close()
      return state
        .set('connected', initialInstanceConnectionState.connected)
        .set('instanceServerConnecting', initialInstanceConnectionState.instanceServerConnecting)
        .set('instanceProvisioning', initialInstanceConnectionState.instanceProvisioning)
        .set('instanceProvisioned', initialInstanceConnectionState.instanceProvisioned)
        .set('readyToConnect', initialInstanceConnectionState.readyToConnect)
        .set('updateNeeded', initialInstanceConnectionState.updateNeeded)
        .set('instance', new Map(Object.entries(initialInstanceConnectionState.instance)))
        .set('locationId', initialInstanceConnectionState.locationId)
        .set('sceneId', initialInstanceConnectionState.sceneId)
        .set('channelId', initialInstanceConnectionState.channelId)
    case SOCKET_CREATED:
      if (connectionSocket != null) (connectionSocket as any).close()
      connectionSocket = (action as SocketCreatedAction).socket
      return state
  }

  return state
}

export default instanceConnectionReducer
