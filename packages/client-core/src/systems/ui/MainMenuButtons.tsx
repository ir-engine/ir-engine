import { createState } from '@speigg/hookstate'
import React, { useEffect, useState } from 'react'

import { VrIcon } from '@xrengine/client-core/src/common/components/Icons/Vricon'
import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { respawnAvatar } from '@xrengine/engine/src/avatar/functions/respawnAvatar'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { dispatchAction } from '@xrengine/hyperflux'

import { Message as MessageIcon } from '@mui/icons-material'
import LinkIcon from '@mui/icons-material/Link'
import RefreshIcon from '@mui/icons-material/Refresh'
import SettingsIcon from '@mui/icons-material/Settings'

import { useChatState } from '../../social/services/ChatService'
import { EmoteIcon } from '../../user/components/UserMenu'
import { MainMenuButtonState } from '../state/MainMenuButtonState'

const styles = {
  container: {
    display: 'grid',
    gridGap: '10px',
    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr'
  },
  button: {
    margin: '5px 15px 10px 10px',
    alignItems: 'center',
    zIndex: '20',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    fontSize: '20px',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'var(--iconButtonBackground)',
    color: 'var(--iconButtonColor)'
  }
}

export function createMainMenuButtonsView() {
  return createXRUI(MainMenuButtons, createMainMenuButtonsState())
}

function createMainMenuButtonsState() {
  return createState({})
}

const MainMenuButtons = () => {
  let activeChannel: Channel | null = null
  const chatState = useChatState()
  const engineState = useEngineState()
  const channelState = chatState.channels
  const channels = channelState.channels.value as Channel[]
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

  const toogleVRSession = () => {
    if (engineState.xrSessionStarted.value) {
      dispatchAction(EngineActions.xrEnd())
    } else {
      dispatchAction(EngineActions.xrStart())
    }
  }

  const handleRespawnAvatar = () => {
    respawnAvatar(useWorld().localClientEntity)
  }

  return (
    <div style={styles.container as {}} xr-layer="true">
      <style>{`
        .svgIcon {
          width: 1.5em;
          height: 1.5em;
        }

        .svgIcon path {
          fill: var(--iconButtonColor) !important;
        }
      `}</style>
      <div style={styles.button} onClick={handleRespawnAvatar}>
        <RefreshIcon className="svgIcon" />
      </div>
      <div style={styles.button} onClick={toggleEmoteMenu}>
        <EmoteIcon />
      </div>
      <div style={styles.button} onClick={toggleShareMenu}>
        <LinkIcon className="svgIcon" />
      </div>
      <div style={styles.button} onClick={toggleSettingMenu}>
        <SettingsIcon className="svgIcon" />
      </div>
      <div style={styles.button} onClick={toggleChatWindow}>
        <MessageIcon className="svgIcon" />
      </div>
      <div style={styles.button} onClick={toogleVRSession}>
        <VrIcon />
      </div>
    </div>
  )
}
