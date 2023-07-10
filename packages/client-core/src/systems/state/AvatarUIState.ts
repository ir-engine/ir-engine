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
