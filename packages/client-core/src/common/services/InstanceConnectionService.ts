import { client } from '../../feathers'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { store, useDispatch } from '../../store'
import { leave } from '../../transports/SocketWebRTCClientFunctions'
import { MediaStreamService } from '../../media/services/MediaStreamService'
import { accessAuthState } from '../../user/services/AuthService'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { InstanceServerProvisionResult } from '@xrengine/common/src/interfaces/InstanceServerProvisionResult'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineService'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'

//State
const state = createState({
  instance: {
    id: '',
    ipAddress: '',
    port: ''
  },
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

store.receptors.push((action: InstanceConnectionActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'INSTANCE_SERVER_PROVISIONING':
        return s.merge({
          connected: false,
          instanceProvisioned: false,
          readyToConnect: false,
          instanceProvisioning: true
        })
      case 'INSTANCE_SERVER_PROVISIONED':
        return s.merge({
          instance: { id: action.id, ipAddress: action.ipAddress, port: action.port },
          locationId: action.locationId!,
          sceneId: action.sceneId!,
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
      case 'INSTANCE_SERVER_DISCONNECT':
        return s.merge({
          instance: {
            id: '',
            ipAddress: '',
            port: ''
          },
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
    }
  }, action.type)
})

export const accessInstanceConnectionState = () => state

export const useInstanceConnectionState = () => useState(state) as any as typeof state

//Service
export const InstanceConnectionService = {
  provisionInstanceServer: async (locationId?: string, instanceId?: string, sceneId?: string) => {
    const dispatch = useDispatch()
    dispatch(InstanceConnectionAction.instanceServerProvisioning())
    const token = accessAuthState().authUser.accessToken.value
    if (instanceId != null) {
      const instance = await client.service('instance').find({
        query: {
          id: instanceId,
          ended: false
        }
      })
      if (instance.total === 0) {
        instanceId = null!
      }
    }
    const provisionResult = await client.service('instance-provision').find({
      query: {
        locationId: locationId,
        instanceId: instanceId,
        sceneId: sceneId,
        token: token
      }
    })
    if (provisionResult.ipAddress && provisionResult.port) {
      dispatch(InstanceConnectionAction.instanceServerProvisioned(provisionResult, locationId!, sceneId!))
    } else {
      EngineEvents.instance.dispatchEvent({
        type: SocketWebRTCClientTransport.EVENTS.PROVISION_INSTANCE_NO_GAMESERVERS_AVAILABLE
      })
    }
  },
  connectToInstanceServer: async () => {
    const dispatch = useDispatch()
    try {
      dispatch(InstanceConnectionAction.instanceServerConnecting())
      const transport = Network.instance.transportHandler.getWorldTransport() as SocketWebRTCClientTransport
      if (transport.socket) {
        console.log('leave instance')
        await leave(transport, true)
      }

      try {
        await transport.initialize(accessInstanceConnectionState().value)
        transport.left = false

        const authState = accessAuthState()
        const user = authState.user.value
        dispatchLocal(EngineActions.connect(user.id) as any)

        EngineEvents.instance.addEventListener(
          MediaStreams.EVENTS.TRIGGER_UPDATE_CONSUMERS,
          MediaStreamService.triggerUpdateConsumers
        )
      } catch (error) {
        console.error('Network transport could not initialize, transport is: ', transport)
      }
    } catch (err) {
      console.log(err)
    }
  },
  resetInstanceServer: async () => {
    const dispatch = useDispatch()
    dispatch(InstanceConnectionAction.disconnect())
  }
}

client.service('instance-provision').on('created', (params) => {
  if (params.locationId != null)
    store.dispatch(InstanceConnectionAction.instanceServerProvisioned(params, params.locationId, params.sceneId))
})

//Action

export const InstanceConnectionAction = {
  instanceServerProvisioning: () => {
    return {
      type: 'INSTANCE_SERVER_PROVISIONING' as const
    }
  },
  instanceServerProvisioned: (
    provisionResult: InstanceServerProvisionResult,
    locationId: string | null,
    sceneId: string | null
  ) => {
    return {
      type: 'INSTANCE_SERVER_PROVISIONED' as const,
      id: provisionResult.id,
      ipAddress: provisionResult.ipAddress,
      port: provisionResult.port,
      locationId: locationId,
      sceneId: sceneId
    }
  },
  instanceServerConnecting: () => {
    return {
      type: 'INSTANCE_SERVER_CONNECTING' as const
    }
  },
  instanceServerConnected: () => {
    return {
      type: 'INSTANCE_SERVER_CONNECTED' as const
    }
  },
  disconnect: () => {
    return {
      type: 'INSTANCE_SERVER_DISCONNECT' as const
    }
  }
}

export type InstanceConnectionActionType = ReturnType<
  typeof InstanceConnectionAction[keyof typeof InstanceConnectionAction]
>
