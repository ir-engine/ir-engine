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

import { matches } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { NetworkTopics } from '@etherealengine/engine/src/networking/classes/Network'
import { defineAction, defineState, none, receiveActions } from '@etherealengine/hyperflux'

export class AvatarUIActions {
  static setUserTyping = defineAction({
    type: 'ee.client.avatar.USER_IS_TYPING',
    typing: matches.boolean,
    $topic: NetworkTopics.world
  })
}

export const AvatarUIState = defineState({
  name: 'AvatarUIState',

  initial: {
    usersTyping: {} as { [key: string]: true }
  },

  receptors: [
    [
      AvatarUIActions.setUserTyping,
      (state, action) => {
        state.usersTyping[action.$from].set(action.typing ? true : none)
      }
    ]
  ]
})

export const AvatarUIStateSystem = defineSystem({
  uuid: 'ee.engine.avatar.AvatarUIStateSystem',
  execute: () => {
    receiveActions(AvatarUIState)
  }
})
