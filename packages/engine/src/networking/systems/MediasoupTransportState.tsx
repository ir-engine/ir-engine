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

import { defineAction, defineState, none, receiveActions } from '@etherealengine/hyperflux'
import { matches } from '../../common/functions/MatchesUtils'
import { Engine } from '../../ecs/classes/Engine'
import { defineSystem } from '../../ecs/functions/SystemFunctions'

export class MediasoupTransportActions {
  static requestTransport = defineAction({
    type: 'ee.engine.network.mediasoup.TRANSPORT_REQUEST_CREATE',
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
    transportID: matches.string,
    direction: matches.literals('send', 'recv'),
    sctpParameters: matches.object,
    iceParameters: matches.object,
    iceCandidates: matches.arrayOf(matches.object),
    dtlsParameters: matches.object
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

export const MediasoupTransportState = defineState({
  name: 'ee.engine.network.MediasoupTransportState',

  initial: {} as Record<
    string, // NetworkID
    {
      [transportID: string]: {
        // peerID: PeerID // TODO
        // transport: Transport // TODO
        direction: 'send' | 'recv'
        connected: boolean
      }
    }
  >,

  receptors: [
    [
      MediasoupTransportActions.transportCreated,
      (state, action: typeof MediasoupTransportActions.transportCreated.matches._TYPE) => {
        const networkID = action.$network
        if (!state.value[networkID]) {
          state.merge({ [networkID]: {} })
        }
        state[networkID].merge({
          [action.transportID]: {
            direction: action.direction,
            connected: false
          }
        })
      }
    ],
    [
      MediasoupTransportActions.transportConnected,
      (state, action: typeof MediasoupTransportActions.transportConnected.matches._TYPE) => {
        const networkID = action.$network
        if (!state.value[networkID]) return
        state[networkID][action.transportID].connected.set(true)
      }
    ],
    [
      MediasoupTransportActions.transportClosed,
      (state, action: typeof MediasoupTransportActions.transportClosed.matches._TYPE) => {
        // removed create/close cached actions for this producer
        const cachedActions = Engine.instance.store.actions.cached
        const peerCachedActions = cachedActions.filter(
          (cachedAction) =>
            (MediasoupTransportActions.transportCreated.matches.test(cachedAction) ||
              MediasoupTransportActions.transportClosed.matches.test(cachedAction)) &&
            cachedAction.transportID === action.transportID
        )
        for (const cachedAction of peerCachedActions) {
          cachedActions.splice(cachedActions.indexOf(cachedAction), 1)
        }

        const networkID = action.$network
        if (!state.value[networkID]) return

        state[networkID].transports[action.transportID].set(none)

        if (!Object.keys(state[networkID].transports).length && !Object.keys(state[networkID].consumers).length) {
          state[networkID].set(none)
        }
      }
    ]
  ]
})

const execute = () => {
  receiveActions(MediasoupTransportState)
}

export const MediasoupTransportStateSystem = defineSystem({
  uuid: 'ee.engine.network.MediasoupTransportStateSystem',
  execute
})
