import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { store } from '../../store'

import { InstanceConnectionActionType } from './InstanceConnectionActions'

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

store.receptors.push((action: InstanceConnectionActionType): any => {
  let newValues, newInstance
  state.batch((s) => {
    switch (action.type) {
      case 'INSTANCE_SERVER_PROVISIONING':
        newInstance = new Map(Object.entries(s.instance.value))
        return s.merge({
          instance: newInstance,
          socket: {},
          connected: false,
          instanceProvisioned: false,
          readyToConnect: false,
          instanceProvisioning: true
        })
      case 'INSTANCE_SERVER_PROVISIONED':
        newValues = action
        return s.merge({
          instance: { ipAddress: newValues.ipAddress, port: newValues.port },
          locationId: newValues.locationId,
          sceneId: newValues.sceneId,
          instanceProvisioning: false,
          instanceProvisioned: true,
          readyToConnect: true,
          updateNeeded: true,
          connected: false
        })
      case 'INSTANCE_SERVER_CONNECTING':
        return s.instanceServerConnecting.set(true)
      case 'INSTANCE_SERVER_CONNECTED':
        return s.merge({ connected: true, instanceServerConnecting: false, updateNeeded: false, readyToConnect: false })
      case 'INSTANCE_SERVER_DISCONNECTED':
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
})

export const accessInstanceConnectionState = () => state

export const useInstanceConnectionState = () => useState(state) as any as typeof state
