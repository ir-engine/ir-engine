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
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { UserID } from '../../schemas/user/user.schema'

export class NetworkTransportActions {
  static requestTransport = defineAction({
    type: 'ee.engine.network.TRANSPORT_REQUEST_CREATE',
    direction: matches.literals('send', 'recv'),
    sctpCapabilities: matches.object
  })

  static requestTransportError = defineAction({
    type: 'ee.engine.network.TRANSPORT_REQUEST_ERROR_CREATE',
    error: matches.string,
    direction: matches.literals('send', 'recv')
  })

  static transportCreated = defineAction({
    type: 'ee.engine.network.TRANSPORT_CREATED',
    transportID: matches.string,
    direction: matches.literals('send', 'recv'),
    sctpParameters: matches.object,
    iceParameters: matches.object,
    iceCandidates: matches.arrayOf(matches.object),
    dtlsParameters: matches.object
  })

  static requestTransportConnect = defineAction({
    type: 'ee.engine.network.TRANSPORT_REQUEST_CONNECT',
    requestID: matches.string,
    transportID: matches.string,
    dtlsParameters: matches.object
  })

  static requestTransportConnectError = defineAction({
    type: 'ee.engine.network.TRANSPORT_REQUEST_ERROR_CONNECT',
    requestID: matches.string,
    error: matches.string
  })

  static transportConnected = defineAction({
    type: 'ee.engine.network.TRANSPORT_CONNECTED',
    requestID: matches.string,
    transportID: matches.string
  })

  static closeTransport = defineAction({
    type: 'ee.engine.network.TRANSPORT_CLOSED',
    transportID: matches.string
  })
}

export const NetworkTransportState = defineState({
  name: 'ee.engine.network.NetworkTransportState',

  initial: {} as Record<
    UserID, // NetworkID
    {
      [transportID: string]: {
        direction: 'send' | 'recv'
        connected: boolean
      }
    }
  >,

  // TODO: support multiple networks
  receptors: [
    [
      NetworkTransportActions.transportCreated,
      (state, action: typeof NetworkTransportActions.transportCreated.matches._TYPE) => {
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
      NetworkTransportActions.transportConnected,
      (state, action: typeof NetworkTransportActions.transportConnected.matches._TYPE) => {
        const networkID = action.$network
        if (!state.value[networkID]) return
        state[networkID][action.transportID].connected.set(true)
      }
    ],
    [
      NetworkTransportActions.closeTransport,
      (state, action: typeof NetworkTransportActions.closeTransport.matches._TYPE) => {
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
  receiveActions(NetworkTransportState)
}

export const NetworkTransportStateSystem = defineSystem({
  uuid: 'ee.engine.NetworkTransportStateSystem',
  execute
})
