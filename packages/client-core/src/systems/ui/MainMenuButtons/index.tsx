import { createState } from '@speigg/hookstate'
import React, { useEffect, useState } from 'react'

import { VrIcon } from '@xrengine/client-core/src/common/components/Icons/Vricon'
import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { respawnAvatar } from '@xrengine/engine/src/avatar/functions/respawnAvatar'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { dispatchAction } from '@xrengine/hyperflux'

import { Message as MessageIcon } from '@mui/icons-material'
import { Link as LinkIcon, Mic, MicOff, Refresh as RefreshIcon, Settings as SettingsIcon } from '@mui/icons-material'

import { MediaInstanceConnectionService } from '../../../common/services/MediaInstanceConnectionService'
import { MediaStreamService, useMediaStreamState } from '../../../media/services/MediaStreamService'
import { useChatState } from '../../../social/services/ChatService'
import {
  configureMediaTransports,
  createCamAudioProducer,
  endVideoChat,
  leaveNetwork,
  pauseProducer,
  resumeProducer
} from '../../../transports/SocketWebRTCClientFunctions'
import { SocketWebRTCClientNetwork } from '../../../transports/SocketWebRTCClientNetwork'
import { EmoteIcon } from '../../../user/components/UserMenu'
import { MainMenuButtonState } from '../../state/MainMenuButtonState'
import styleString from './index.scss'

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
  const channelEntries = Object.values(channels).filter((channel) => !!channel) as any
  const instanceChannel = channelEntries.find(
    (entry) => entry.instanceId === Engine.instance.currentWorld.worldNetwork?.hostId
  )
  const mediastream = useMediaStreamState()
  const isCamAudioEnabled = mediastream.isCamAudioEnabled

  useEffect(() => {
    activeChannel &&
      activeChannel.messages &&
      activeChannel.messages.length > 0 &&
      !MainMenuButtonState.chatMenuOpen.value &&
      setUnreadMessages(true)
  }, [activeChannel?.messages])

  const toggleChatWindow = () => {
    if (!MainMenuButtonState.showButtons.value) return
    if (!MainMenuButtonState.chatMenuOpen.value) {
      MainMenuButtonState.emoteMenuOpen.set(false)
      MainMenuButtonState.shareMenuOpen.set(false)
      MainMenuButtonState.settingMenuOpen.set(false)
    }
    MainMenuButtonState.chatMenuOpen.set(!MainMenuButtonState.chatMenuOpen.value)
    MainMenuButtonState.chatMenuOpen.value && setUnreadMessages(false)
  }

  const toggleEmoteMenu = () => {
    if (!MainMenuButtonState.showButtons.value) return
    if (!MainMenuButtonState.emoteMenuOpen.value) {
      MainMenuButtonState.chatMenuOpen.set(false)
      MainMenuButtonState.shareMenuOpen.set(false)
      MainMenuButtonState.settingMenuOpen.set(false)
    }
    MainMenuButtonState.emoteMenuOpen.set(!MainMenuButtonState.emoteMenuOpen.value)
  }

  const toggleShareMenu = () => {
    if (!MainMenuButtonState.showButtons.value) return
    if (!MainMenuButtonState.shareMenuOpen.value) {
      MainMenuButtonState.emoteMenuOpen.set(false)
      MainMenuButtonState.chatMenuOpen.set(false)
      MainMenuButtonState.settingMenuOpen.set(false)
    }
    MainMenuButtonState.shareMenuOpen.set(!MainMenuButtonState.shareMenuOpen.value)
  }

  const toggleSettingMenu = () => {
    if (!MainMenuButtonState.showButtons.value) return
    if (!MainMenuButtonState.settingMenuOpen.value) {
      MainMenuButtonState.emoteMenuOpen.set(false)
      MainMenuButtonState.shareMenuOpen.set(false)
      MainMenuButtonState.chatMenuOpen.set(false)
    }
    MainMenuButtonState.settingMenuOpen.set(!MainMenuButtonState.settingMenuOpen.value)
  }

  const toogleVRSession = () => {
    if (!MainMenuButtonState.showButtons.value) return
    if (engineState.xrSessionStarted.value) {
      dispatchAction(EngineActions.xrEnd())
    } else {
      dispatchAction(EngineActions.xrStart())
    }
  }

  const handleRespawnAvatar = () => {
    if (!MainMenuButtonState.showButtons.value) return
    respawnAvatar(useWorld().localClientEntity)
  }

  const checkEndVideoChat = async () => {
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    if (
      (MediaStreams.instance.audioPaused || MediaStreams.instance.camAudioProducer == null) &&
      (MediaStreams.instance.videoPaused || MediaStreams.instance.camVideoProducer == null) &&
      instanceChannel.channelType !== 'instance'
    ) {
      await endVideoChat(mediaNetwork, {})
      if (mediaNetwork.socket?.connected === true) {
        await leaveNetwork(mediaNetwork, false)
        await MediaInstanceConnectionService.provisionServer(instanceChannel.id)
      }
    }
  }

  const handleMicClick = async () => {
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    if (await configureMediaTransports(mediaNetwork, ['audio'])) {
      if (MediaStreams.instance.camAudioProducer == null) await createCamAudioProducer(mediaNetwork)
      else {
        const audioPaused = MediaStreams.instance.toggleAudioPaused()
        if (audioPaused) await pauseProducer(mediaNetwork, MediaStreams.instance.camAudioProducer)
        else await resumeProducer(mediaNetwork, MediaStreams.instance.camAudioProducer)
        checkEndVideoChat()
      }
      MediaStreamService.updateCamAudioState()
    }
  }

  const MicIcon = isCamAudioEnabled.value ? Mic : MicOff

  return (
    <div className="container" xr-layer="true">
      <style>{styleString}</style>
      <div className="button" onClick={handleRespawnAvatar}>
        <RefreshIcon className="svgIcon" />
      </div>
      <div className="button" onClick={handleMicClick}>
        <MicIcon />
      </div>
      <div className="button" onClick={toggleEmoteMenu}>
        <EmoteIcon />
      </div>
      <div className="button" onClick={toggleShareMenu}>
        <LinkIcon className="svgIcon" />
      </div>
      <div className="button" onClick={toggleSettingMenu}>
        <SettingsIcon className="svgIcon" />
      </div>
      <div className="button" onClick={toggleChatWindow}>
        <MessageIcon className="svgIcon" />
      </div>
      <div className="button" onClick={toogleVRSession}>
        <VrIcon />
      </div>
    </div>
  )
}
