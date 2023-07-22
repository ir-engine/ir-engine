import { ChannelID } from '@etherealengine/common/src/interfaces/ChannelUser'
import { defineState } from '@etherealengine/hyperflux'

export const ChatState = defineState({
  name: 'ee.ui.chat.ChatState',
  initial: () => ({
    selectedChannelID: null as ChannelID | null
  })
})
