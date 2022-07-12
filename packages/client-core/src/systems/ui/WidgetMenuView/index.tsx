import { createState } from '@speigg/hookstate'
import React, { useState } from 'react'

import { VrIcon } from '@xrengine/client-core/src/common/components/Icons/Vricon'
import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { respawnAvatar } from '@xrengine/engine/src/avatar/functions/respawnAvatar'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { accessWidgetAppState, useWidgetAppState, WidgetAppActions } from '@xrengine/engine/src/xrui/WidgetAppService'
import { dispatchAction } from '@xrengine/hyperflux'

import { Mic, MicOff, Refresh as RefreshIcon } from '@mui/icons-material'

import { MediaInstanceConnectionService } from '../../../common/services/MediaInstanceConnectionService'
import { MediaStreamService, useMediaStreamState } from '../../../media/services/MediaStreamService'
import { useChatState } from '../../../social/services/ChatService'
import { MediaStreams } from '../../../transports/MediaStreams'
import {
  configureMediaTransports,
  createCamAudioProducer,
  endVideoChat,
  leaveNetwork,
  pauseProducer,
  resumeProducer
} from '../../../transports/SocketWebRTCClientFunctions'
import { SocketWebRTCClientNetwork } from '../../../transports/SocketWebRTCClientNetwork'
import styleString from './index.scss'

export function createWidgetButtonsView() {
  return createXRUI(WidgetButtons, createWidgetButtonsState())
}

function createWidgetButtonsState() {
  return createState({})
}

type WidgetButtonProps = {
  Icon: any
  toggle: () => any
  label: string
}

const WidgetButton = ({ Icon, toggle, label }: WidgetButtonProps) => {
  const [mouseOver, setMouseOver] = useState(false)
  return (
    <div
      className="button"
      onClick={toggle}
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
      xr-layer="true"
    >
      <Icon className="svgIcon" />
      {mouseOver && <div>{label}</div>}
    </div>
  )
}

const WidgetButtons = () => {
  let activeChannel: Channel | null = null
  const chatState = useChatState()
  const engineState = useEngineState()
  const widgetState = useWidgetAppState()
  const channelState = chatState.channels
  const channels = channelState.channels.value as Channel[]
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

  // TODO: add a notification hint function to the widget wrapper and move unread messages there
  // useEffect(() => {
  //   activeChannel &&
  //     activeChannel.messages &&
  //     activeChannel.messages.length > 0 &&
  //     !widgetState.chatMenuOpen.value &&
  //     setUnreadMessages(true)
  // }, [activeChannel?.messages])

  const toogleVRSession = () => {
    if (engineState.xrSessionStarted.value) {
      dispatchAction(EngineActions.xrEnd())
    } else {
      dispatchAction(EngineActions.xrStart())
    }
  }

  const handleRespawnAvatar = () => {
    respawnAvatar(Engine.instance.currentWorld.localClientEntity)
  }

  const widgets = Object.entries(widgetState.widgets.value).map(([id, widgetState]) => ({
    id,
    ...widgetState,
    ...Engine.instance.currentWorld.widgets.get(id)!
  }))

  const toggleWidget = (toggledWidget) => () => {
    const state = accessWidgetAppState().widgets.value
    const visible = state[toggledWidget.id].visible
    // close currently open widgets until we support multiple widgets being open at once
    if (!visible) {
      Object.entries(state).forEach(([id, widget]) => {
        if (widget.visible && id !== toggledWidget.id) dispatchAction(WidgetAppActions.showWidget({ id, shown: false }))
      })
    }
    dispatchAction(WidgetAppActions.showWidget({ id: toggledWidget.id, shown: !visible }))
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
    <>
      <style>{styleString}</style>
      <div
        className="container"
        style={{
          gridTemplateColumns: '1fr 1fr' + widgets.map(() => ' 1fr').flat()
        }}
        xr-pixel-ratio="8"
        xr-layer="true"
      >
        <WidgetButton Icon={RefreshIcon} toggle={handleRespawnAvatar} label={'Respawn'} />
        <WidgetButton
          Icon={MicIcon}
          toggle={handleMicClick}
          label={isCamAudioEnabled.value ? 'Audio on' : 'Audio Off'}
        />
        <WidgetButton
          Icon={VrIcon}
          toggle={toogleVRSession}
          label={engineState.xrSessionStarted.value ? 'Exit VR' : 'Enter VR'}
        />
        {widgets.map(
          (widget, i) =>
            widget.enabled &&
            widget.icon && (
              <WidgetButton key={i} Icon={widget.icon} toggle={toggleWidget(widget)} label={widget.label} />
            )
        )}
      </div>
    </>
  )
}
