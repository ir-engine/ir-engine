import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { DataChannelType } from '@etherealengine/engine/src/networking/classes/Network'
import { dataChannelRegistry, NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { getMutableState, getState } from '@etherealengine/hyperflux'

import { useWorldInstance } from '../../common/services/LocationInstanceConnectionService'
import {
  createDataConsumer,
  createDataProducer,
  SocketWebRTCClientNetwork
} from '../../transports/SocketWebRTCClientFunctions'

export const DataChannel = ({ dataChannelType }: { dataChannelType: DataChannelType }) => {
  const currentLocationInstanceConnection = useWorldInstance()
  const connectedToWorld = useHookstate(getMutableState(EngineState).connectedWorld)

  useEffect(() => {
    if (!currentLocationInstanceConnection?.connected?.value || !connectedToWorld.value) return

    const network = Engine.instance.worldNetwork as SocketWebRTCClientNetwork
    createDataProducer(network, dataChannelType)
    createDataConsumer(network, dataChannelType)

    return () => {
      // todo - cleanup
    }
  }, [currentLocationInstanceConnection?.connected, connectedToWorld])

  return <></>
}

export const DataChannels = () => {
  useHookstate(getMutableState(NetworkState))
  return (
    <>
      {Array.from(dataChannelRegistry.keys()).map((dataChannelType) => (
        <DataChannel key={dataChannelType} dataChannelType={dataChannelType as DataChannelType} />
      ))}
    </>
  )
}
