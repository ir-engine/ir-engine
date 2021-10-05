import { createState, useState, none, Downgraded } from '@hookstate/core'

import { ChannelConnectionActionType } from './ChannelConnectionActions'

const state = createState({
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
})

let connectionSocket = null

export const channelConnectionReducer = (_, action: ChannelConnectionActionType) => {
  Promise.resolve().then(() => channelConnectionReceptor(action))
  return state.attach(Downgraded).value
}

const channelConnectionReceptor = (action: ChannelConnectionActionType): any => {
  let newValues, newInstance, newClient
  state.batch((s) => {
    switch (action.type) {
      case 'CHANNEL_SERVER_PROVISIONING':
        newInstance = new Map(Object.entries(s.instance.value))
        return s.merge({
          instance: newInstance,
          socket: {},
          connected: false,
          instanceProvisioned: false,
          readyToConnect: false,
          instanceProvisioning: true
        })
      case 'CHANNEL_SERVER_PROVISIONED':
        newValues = action
        s.instance.ipAddress.set(newValues.ipAddress)
        s.instance.port.set(newValues.port)
        s.channelId.set(newValues.channelId)
        s.instanceProvisioning.set(false)
        s.instanceProvisioned.set(true)
        s.readyToConnect.set(true)
        s.updateNeeded.set(true)
        return s.connected.set(false)
      case 'CHANNEL_SERVER_CONNECTING':
        return s.instanceServerConnecting.set(true)
      case 'CHANNEL_SERVER_CONNECTED':
        return s.merge({ connected: true, instanceServerConnecting: false, updateNeeded: false, readyToConnect: false })
      case 'CHANNEL_SERVER_DISCONNECTED':
        if (connectionSocket != null) (connectionSocket as any).close()
        newInstance = new Map(Object.entries(s.instance.value))
        return s.merge({
          instance: newInstance,
          socket: s.socket.value,
          locationId: s.locationId.value,
          sceneId: s.sceneId.value,
          channelId: s.channelId.value,
          instanceProvisioned: s.instanceProvisioned.value,
          connected: s.connected.value,
          readyToConnect: s.readyToConnect.value,
          updateNeeded: s.updateNeeded.value,
          instanceServerConnecting: s.instanceServerConnecting.value,
          instanceProvisioning: s.instanceProvisioning.value
        })
      case 'SOCKET_CREATED':
        if (connectionSocket != null) (connectionSocket as any).close()
        connectionSocket = action.socket
        return state
    }
  }, action.type)
}

export const accessChannelConnectionState = () => state
export const useChannelConnectionState = () => useState(state)
