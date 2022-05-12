import { Paginated } from '@feathersjs/feathers'
import { createState, useState } from '@speigg/hookstate'

import { Instance } from '@xrengine/common/src/interfaces/Instance'
import { InstanceServerProvisionResult } from '@xrengine/common/src/interfaces/InstanceServerProvisionResult'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineState'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { dispatchAction } from '@xrengine/hyperflux'

import { client } from '../../feathers'
import { accessLocationState } from '../../social/services/LocationService'
import { store, useDispatch } from '../../store'
import { leave } from '../../transports/SocketWebRTCClientFunctions'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import { accessAuthState } from '../../user/services/AuthService'

//State
const state = createState({
  instance: {
    id: '',
    ipAddress: '',
    port: ''
  },
  locationId: '',
  sceneId: '',
  provisioned: false,
  connected: false,
  readyToConnect: false,
  updateNeeded: false,
  connecting: false,
  provisioning: false
})

store.receptors.push((action: LocationInstanceConnectionActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'LOCATION_INSTANCE_SERVER_PROVISIONING':
        return s.merge({
          connected: false,
          provisioned: false,
          readyToConnect: false,
          provisioning: true
        })
      case 'LOCATION_INSTANCE_SERVER_PROVISIONED':
        return s.merge({
          instance: { id: action.id, ipAddress: action.ipAddress, port: action.port },
          locationId: action.locationId!,
          sceneId: action.sceneId!,
          provisioning: false,
          provisioned: true,
          readyToConnect: true,
          updateNeeded: true,
          connected: false
        })
      case 'LOCATION_INSTANCE_SERVER_CONNECTING':
        return s.connecting.set(true)
      case 'LOCATION_INSTANCE_SERVER_CONNECTED':
        return s.merge({ connected: true, connecting: false, updateNeeded: false, readyToConnect: false })
      case 'LOCATION_INSTANCE_SERVER_DISCONNECT':
        return s.merge({
          instance: {
            id: '',
            ipAddress: '',
            port: ''
          },
          locationId: '',
          sceneId: '',
          provisioned: false,
          connected: false,
          readyToConnect: false,
          updateNeeded: false,
          connecting: false,
          provisioning: false
        })
    }
  }, action.type)
})

export const accessLocationInstanceConnectionState = () => state

export const useLocationInstanceConnectionState = () => useState(state) as any as typeof state

//Service
export const LocationInstanceConnectionService = {
  provisionServer: async (locationId?: string, instanceId?: string, sceneId?: string) => {
    console.log('provisionServer', locationId, instanceId, sceneId)
    const dispatch = useDispatch()
    dispatch(LocationInstanceConnectionAction.serverProvisioning())
    const token = accessAuthState().authUser.accessToken.value
    if (instanceId != null) {
      const instance = (await client.service('instance').find({
        query: {
          id: instanceId,
          ended: false
        }
      })) as Paginated<Instance>
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
      dispatch(LocationInstanceConnectionAction.serverProvisioned(provisionResult, locationId!, sceneId!))
    } else {
      dispatchAction(
        Engine.instance.store,
        SocketWebRTCClientTransport.actions.noWorldServersAvailable({ instanceId: instanceId! })
      )
    }
  },
  connectToServer: async () => {
    const dispatch = useDispatch()
    dispatch(LocationInstanceConnectionAction.connecting())
    const transport = Network.instance.transportHandler.getWorldTransport() as SocketWebRTCClientTransport
    console.log('connectToServer', !!transport.socket, transport)
    if (transport.socket) {
      await leave(transport, false)
    }
    const locationState = accessLocationState()
    const currentLocation = locationState.currentLocation.location
    const sceneId = currentLocation?.sceneId?.value

    const { ipAddress, port } = accessLocationInstanceConnectionState().instance.value

    try {
      await transport.initialize({ sceneId, port, ipAddress, locationId: currentLocation.id.value })
      transport.left = false

      const authState = accessAuthState()
      const user = authState.user.value
      dispatchAction(Engine.instance.store, EngineActions.connect({ id: user.id! }))
    } catch (error) {
      console.error('Network transport could not initialize, transport is: ', transport)
    }
  }
}

client.service('instance-provision').on('created', (params) => {
  if (params.locationId != null)
    store.dispatch(LocationInstanceConnectionAction.serverProvisioned(params, params.locationId, params.sceneId))
})

//Action

export const LocationInstanceConnectionAction = {
  serverProvisioning: () => {
    return {
      type: 'LOCATION_INSTANCE_SERVER_PROVISIONING' as const
    }
  },
  serverProvisioned: (
    provisionResult: InstanceServerProvisionResult,
    locationId: string | null,
    sceneId: string | null
  ) => {
    return {
      type: 'LOCATION_INSTANCE_SERVER_PROVISIONED' as const,
      id: provisionResult.id,
      ipAddress: provisionResult.ipAddress,
      port: provisionResult.port,
      locationId: locationId,
      sceneId: sceneId
    }
  },
  connecting: () => {
    return {
      type: 'LOCATION_INSTANCE_SERVER_CONNECTING' as const
    }
  },
  instanceServerConnected: () => {
    return {
      type: 'LOCATION_INSTANCE_SERVER_CONNECTED' as const
    }
  },
  disconnect: () => {
    return {
      type: 'LOCATION_INSTANCE_SERVER_DISCONNECT' as const
    }
  }
}

export type LocationInstanceConnectionActionType = ReturnType<
  typeof LocationInstanceConnectionAction[keyof typeof LocationInstanceConnectionAction]
>
