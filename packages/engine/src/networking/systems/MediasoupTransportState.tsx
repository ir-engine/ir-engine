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

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { defineAction, defineState, getMutableState, getState, none, receiveActions } from '@etherealengine/hyperflux'
import { Validator, matches, matchesPeerID } from '../../common/functions/MatchesUtils'
import { isClient } from '../../common/functions/getEnvironment'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { PresentationSystemGroup } from '../../ecs/functions/SystemGroups'
import { InstanceID } from '../../schemas/networking/instance.schema'
import { NetworkState } from '../NetworkState'
import { Network } from '../classes/Network'

export class MediasoupTransportActions {
  static requestTransport = defineAction({
    type: 'ee.engine.network.mediasoup.TRANSPORT_REQUEST_CREATE',
    peerID: matchesPeerID,
    direction: matches.literals('send', 'recv'),
    sctpCapabilities: matches.object
  })

  static requestTransportError = defineAction({
    type: 'ee.engine.network.mediasoup.TRANSPORT_REQUEST_ERROR_CREATE',
    error: matches.string,
    direction: matches.literals('send', 'recv')
  })

  static transportCreated = defineAction({
    type: 'ee.engine.network.mediasoup.TRANSPORT_CREATED',
    peerID: matchesPeerID,
    transportID: matches.string,
    direction: matches.literals('send', 'recv'),
    sctpParameters: matches.object,
    iceParameters: matches.object,
    iceCandidates: matches.arrayOf(matches.object),
    dtlsParameters: matches.object as Validator<
      unknown,
      {
        role?: 'client' | 'server' | 'auto'
        fingerprints: { algorithm: string; value: string }[]
      }
    >
  })

  static requestTransportConnect = defineAction({
    type: 'ee.engine.network.mediasoup.TRANSPORT_REQUEST_CONNECT',
    requestID: matches.string,
    transportID: matches.string,
    dtlsParameters: matches.object
  })

  static requestTransportConnectError = defineAction({
    type: 'ee.engine.network.mediasoup.TRANSPORT_REQUEST_ERROR_CONNECT',
    requestID: matches.string,
    error: matches.string
  })

  static transportConnected = defineAction({
    type: 'ee.engine.network.mediasoup.TRANSPORT_CONNECTED',
    requestID: matches.string,
    transportID: matches.string
  })

  static transportClosed = defineAction({
    type: 'ee.engine.network.mediasoup.TRANSPORT_CLOSED',
    transportID: matches.string
  })
}

export const MediasoupTransportObjectsState = defineState({
  name: 'ee.engine.network.mediasoup.MediasoupTransportObjectsState',

  initial: {} as Record<string, any>
})

export const MediasoupTransportState = defineState({
  name: 'ee.engine.network.mediasoup.MediasoupTransportState',

  initial: {} as Record<
    string, // NetworkID
    {
      [transportID: string]: {
        transportID: string
        peerID: PeerID
        direction: 'send' | 'recv'
        connected: boolean
      }
    }
  >,

  getTransport: (
    networkID: InstanceID,
    direction: 'send' | 'recv',
    peerID = getState(NetworkState).networks[networkID].hostPeerID
  ) => {
    const state = getState(MediasoupTransportState)[networkID]
    if (!state) return

    const transport = Object.values(state).find(
      (transport) => transport.direction === direction && transport.peerID === peerID
    )
    if (!transport) return

    return getState(MediasoupTransportObjectsState)[transport.transportID]
  },

  receptors: [
    MediasoupTransportActions.transportCreated.receive((action) => {
      const state = getMutableState(MediasoupTransportState)
      const networkID = action.$network
      if (!state.value[networkID]) {
        state.merge({ [networkID]: {} })
      }
      const network = getState(NetworkState).networks[networkID] as Network
      state[networkID].merge({
        [action.transportID]: {
          /** Mediasoup is always client-server, so the peerID is always the host for clients */
          peerID: isClient ? network.hostPeerID : action.peerID,
          transportID: action.transportID,
          direction: action.direction,
          connected: false
        }
      })
    }),
    MediasoupTransportActions.transportConnected.receive((action) => {
      const state = getMutableState(MediasoupTransportState)
      const networkID = action.$network
      if (!state.value[networkID]) return
      state[networkID][action.transportID].connected.set(true)
    }),
    MediasoupTransportActions.transportClosed.receive((action) => {
      const network = action.$network
      const state = getMutableState(MediasoupTransportState)
      state[network]?.transports[action.transportID].set(none)
      if (!state[network].transports.keys.length && !state[network].consumers.keys.length) {
        state[network].set(none)
      }
    })
  ]
})

const execute = () => {
  receiveActions(MediasoupTransportState)
}

export const MediasoupTransportStateSystem = defineSystem({
  uuid: 'ee.engine.network.mediasoup.MediasoupTransportStateSystem',
  insert: { after: PresentationSystemGroup },
  execute
})
