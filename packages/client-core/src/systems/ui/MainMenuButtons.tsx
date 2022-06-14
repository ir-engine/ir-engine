import { createState } from '@speigg/hookstate'
import React, { useEffect, useState } from 'react'

import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'

import { Close as CloseIcon, Message as MessageIcon } from '@mui/icons-material'
import LinkIcon from '@mui/icons-material/Link'
import SettingsIcon from '@mui/icons-material/Settings'
import { Badge } from '@mui/material'

import { useChatState } from '../../social/services/ChatService'
import { EmoteIcon } from '../../user/components/UserMenu'
import { MainMenuButtonState, useMainMenuButtonState } from '../state/MainMenuButtonState'

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
    color: 'var(--iconButtonColor)',
    svg: {
      color: 'var(--iconButtonColor)'
    }
  }
}

export function createMainMenuButtonsView() {
  return createXRUI(MainMenuButtons, createMainMenuButtonsState())
}

function createMainMenuButtonsState() {
  return createState({})
}

const MainMenuButtons = () => {
  const mainMenuState = useMainMenuButtonState()

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
      !MainMenuButtonState.chatMenuOpen.value &&
      setUnreadMessages(true)
  }, [activeChannel?.messages])

  const toggleChatWindow = () => {
    if (!MainMenuButtonState.chatMenuOpen.value) {
      MainMenuButtonState.emoteMenuOpen.set(false)
      MainMenuButtonState.shareMenuOpen.set(false)
      MainMenuButtonState.settingMenuOpen.set(false)
    }
    MainMenuButtonState.chatMenuOpen.set(!MainMenuButtonState.chatMenuOpen.value)
    MainMenuButtonState.chatMenuOpen.value && setUnreadMessages(false)
  }

  const toggleEmoteMenu = () => {
    if (!MainMenuButtonState.emoteMenuOpen.value) {
      MainMenuButtonState.chatMenuOpen.set(false)
      MainMenuButtonState.shareMenuOpen.set(false)
      MainMenuButtonState.settingMenuOpen.set(false)
    }
    MainMenuButtonState.emoteMenuOpen.set(!MainMenuButtonState.emoteMenuOpen.value)
  }

  const toggleShareMenu = () => {
    if (!MainMenuButtonState.shareMenuOpen.value) {
      MainMenuButtonState.emoteMenuOpen.set(false)
      MainMenuButtonState.chatMenuOpen.set(false)
      MainMenuButtonState.settingMenuOpen.set(false)
    }
    MainMenuButtonState.shareMenuOpen.set(!MainMenuButtonState.shareMenuOpen.value)
  }

  const toggleSettingMenu = () => {
    if (!MainMenuButtonState.settingMenuOpen.value) {
      MainMenuButtonState.emoteMenuOpen.set(false)
      MainMenuButtonState.shareMenuOpen.set(false)
      MainMenuButtonState.chatMenuOpen.set(false)
    }
    MainMenuButtonState.settingMenuOpen.set(!MainMenuButtonState.settingMenuOpen.value)
  }

  return (
    <div style={styles.container as {}} xr-layer="true">
      <div xr-layer="true" style={styles.button} onClick={toggleEmoteMenu}>
        <EmoteIcon />
      </div>
      <div xr-layer="true" style={styles.button} onClick={toggleShareMenu}>
        <LinkIcon />
      </div>
      <div xr-layer="true" style={styles.button} onClick={toggleSettingMenu}>
        <SettingsIcon />
      </div>
      <div xr-layer="true" style={styles.button} onClick={toggleChatWindow}>
        <Badge
          color="primary"
          variant="dot"
          invisible={!unreadMessages}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          {!mainMenuState.chatMenuOpen.value ? <MessageIcon /> : <CloseIcon />}
        </Badge>
      </div>
    </div>
  )
}
