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

import { useEffect } from 'react'

import { ChannelID } from '@etherealengine/common/src/interfaces/ChannelUser'
import { DataChannelType } from '@etherealengine/common/src/interfaces/DataChannelType'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { defineAction, defineState, none, receiveActions } from '@etherealengine/hyperflux'
import { Validator, matches, matchesPeerID } from '../../common/functions/MatchesUtils'
import { defineSystem } from '../../ecs/functions/SystemFunctions'

export class ProducerActions {
  static createProducer = defineAction({
    type: 'ee.engine.network.CREATE_PRODUCER',
    producerId: matches.string,
    peerID: matchesPeerID,
    mediaTag: matches.string as Validator<unknown, DataChannelType>,
    channelID: matches.string as Validator<unknown, ChannelID>
  })

  static closeProducer = defineAction({
    type: 'ee.engine.network.CLOSED_PRODUCER',
    producerId: matches.string
  })

  static producerCreated = defineAction({
    type: 'ee.engine.network.PRODUCER_CREATED'
  })

  static producerClosed = defineAction({
    type: 'ee.engine.network.PRODUCER_CLOSEDED'
  })

  static producerPaused = defineAction({
    type: 'ee.engine.network.PRODUCER_PAUSED'
  })

  static producerResumed = defineAction({
    type: 'ee.engine.network.PRODUCER_RESUMED'
  })
}

export const ProducerState = defineState({
  name: 'ee.engine.network.ProducerState',

  initial: {} as Record<
    UserId,
    {
      [producerID: string]: {
        peerID: PeerID
        mediaTag: DataChannelType
        channelID: ChannelID
      }
    }
  >,

  receptors: [
    [
      ProducerActions.createProducer,
      (state, action: typeof ProducerActions.createProducer.matches._TYPE) => {
        if (!state.value[action.$from]) {
          state.merge({ [action.$from as UserId]: {} })
        }
        state[action.$from].merge({
          [action.producerId]: {
            peerID: action.peerID,
            mediaTag: action.mediaTag,
            channelID: action.channelID
          }
        })
      }
    ],
    [
      ProducerActions.closeProducer,
      (state, action: typeof ProducerActions.closeProducer.matches._TYPE) => {
        if (!state.value[action.$from]) return

        state[action.$from][action.producerId].set(none)

        if (!Object.keys(state[action.$from]).length) {
          state[action.$from].set(none)
        }
      }
    ]
  ]
})

const execute = () => {
  receiveActions(ProducerState)
}

const reactor = () => {
  useEffect(() => {
    return () => {}
  }, [])
  return null
}

export const ProducerConsumerStateSystem = defineSystem({
  uuid: 'ee.engine.ProducerConsumerStateSystem',
  execute,
  reactor
})
