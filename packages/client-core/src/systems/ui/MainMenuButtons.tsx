import { createState } from '@speigg/hookstate'
import React, { useEffect, useState } from 'react'

import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'

import { Close as CloseIcon, Message as MessageIcon } from '@mui/icons-material'
import LinkIcon from '@mui/icons-material/Link'
import SettingsIcon from '@mui/icons-material/Settings'
import { Badge } from '@mui/material'

import { useChatState } from '../../social/services/ChatService'
import { EmoteIcon } from '../../user/components/UserMenu'
import { useUserState } from '../../user/services/UserService'

const styles = {
  container: {
    display: 'grid',
    gridGap: '10px',
    gridTemplateColumns: '1fr 1fr 1fr 1fr'
  },
  button: {
    margin: '5px 15px 10px 10px',
    alignItems: 'center',
    zIndex: '20',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    fontSize: '20px',
    backgroundColor: 'var(--iconButtonBackground)',
    color: 'var(--iconButtonColor)'
  }
}

export function createMainMenuButtonsView() {
  return createXRUI(MainMenuButtons, createMainMenuButtonsState())
}

function createMainMenuButtonsState() {
  return createState({
    id: '' as UserId,
    chatMenuOpen: false,
    emoteMenuOpen: false,
    settingMenuOpen: false,
    shareMenuOpen: false
  })
}

interface MainMenuButtonsState {
  id: UserId
  chatMenuOpen: boolean
  emoteMenuOpen: boolean
  settingMenuOpen: boolean
  shareMenuOpen: boolean
}

const MainMenuButtons = () => {
  const detailState = useXRUIState<MainMenuButtonsState>()
  const userState = useUserState()
  const user = userState.layerUsers.find((user) => user.id.value === detailState.id.value)

  let activeChannel: Channel | null = null
  const chatState = useChatState()
  const channelState = chatState.channels
  const channels = channelState.channels.value
  const [unreadMessages, setUnreadMessages] = useState(false)
  const activeChannelMatch = Object.entries(channels).find(([key, channel]) => channel.channelType === 'instance')
  if (activeChannelMatch && activeChannelMatch.length > 0) {
    activeChannel = activeChannelMatch[1]
  }

  useEffect(() => {
    activeChannel &&
      activeChannel.messages &&
      activeChannel.messages.length > 0 &&
      !detailState.chatMenuOpen.value &&
      setUnreadMessages(true)
  }, [activeChannel?.messages])

  const toggleChatWindow = () => {
    if (!detailState.chatMenuOpen.value) {
      detailState.emoteMenuOpen.set(false)
      detailState.shareMenuOpen.set(false)
      detailState.settingMenuOpen.set(false)
    }
    detailState.chatMenuOpen.set(!detailState.chatMenuOpen.value)
    detailState.chatMenuOpen.value && setUnreadMessages(false)
  }

  const toggleEmoteMenu = () => {
    if (!detailState.emoteMenuOpen.value) {
      detailState.chatMenuOpen.set(false)
      detailState.shareMenuOpen.set(false)
      detailState.settingMenuOpen.set(false)
    }
    detailState.emoteMenuOpen.set(!detailState.emoteMenuOpen.value)
  }

  const toggleShareMenu = () => {
    if (!detailState.shareMenuOpen.value) {
      detailState.emoteMenuOpen.set(false)
      detailState.chatMenuOpen.set(false)
      detailState.settingMenuOpen.set(false)
    }
    detailState.shareMenuOpen.set(!detailState.shareMenuOpen.value)
  }

  const toggleSettingMenu = () => {
    if (!detailState.settingMenuOpen.value) {
      detailState.emoteMenuOpen.set(false)
      detailState.shareMenuOpen.set(false)
      detailState.chatMenuOpen.set(false)
    }
    detailState.settingMenuOpen.set(!detailState.settingMenuOpen.value)
  }

  return user?.id.value ? (
    <div style={styles.container as {}}>
      <div xr-layer="" style={styles.button} onClick={() => toggleEmoteMenu()}>
        <EmoteIcon />
      </div>
      <div xr-layer="" style={styles.button} onClick={() => toggleShareMenu()}>
        <LinkIcon />
      </div>
      <div xr-layer="" style={styles.button} onClick={() => toggleSettingMenu()}>
        <SettingsIcon />
      </div>
      <div xr-layer="" style={styles.button} onClick={() => toggleChatWindow()}>
        <Badge
          color="primary"
          variant="dot"
          invisible={!unreadMessages}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          {!detailState.chatMenuOpen.value ? <MessageIcon /> : <CloseIcon />}
        </Badge>
      </div>
    </div>
  ) : (
    <div></div>
  )
}
