/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { DataChannelType } from '@etherealengine/engine/src/networking/classes/Network'
import { dataChannelRegistry, NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { getMutableState } from '@etherealengine/hyperflux'

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

  return null
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
