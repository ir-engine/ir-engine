import { createState } from '@hookstate/core'
import React, { useState } from 'react'

// import { VrIcon } from '../../../common/components/Icons/VRIcon'
import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { respawnAvatar } from '@xrengine/engine/src/avatar/functions/respawnAvatar'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { accessWidgetAppState, useWidgetAppState, WidgetAppActions } from '@xrengine/engine/src/xrui/WidgetAppService'
import { dispatchAction } from '@xrengine/hyperflux'

import { Mic, MicOff, Refresh as RefreshIcon } from '@mui/icons-material'

import { useMediaInstanceConnectionState } from '../../../common/services/MediaInstanceConnectionService'
import { MediaStreamService, useMediaStreamState } from '../../../media/services/MediaStreamService'
import { useChatState } from '../../../social/services/ChatService'
import { MediaStreams } from '../../../transports/MediaStreams'
import {
  configureMediaTransports,
  createCamAudioProducer,
  pauseProducer,
  resumeProducer
} from '../../../transports/SocketWebRTCClientFunctions'
import { SocketWebRTCClientNetwork } from '../../../transports/SocketWebRTCClientNetwork'
import XRIconButton from '../../components/XRIconButton'
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
  disabled?: boolean
}

const WidgetButton = ({ Icon, toggle, label, disabled }: WidgetButtonProps) => {
  const [mouseOver, setMouseOver] = useState(false)
  return (
    <XRIconButton
      disabled={disabled}
      size="large"
      content={
        <>
          <Icon className="svgIcon" />
          {mouseOver && <div>{label}</div>}
        </>
      }
      onClick={toggle}
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
      xr-layer="true"
    />
  )
}

const WidgetButtons = () => {
  let activeChannel: Channel | null = null
  const chatState = useChatState()
  const widgetState = useWidgetAppState()
  const channelState = chatState.channels
  const channels = channelState.channels.value as Channel[]
  const activeChannelMatch = Object.entries(channels).find(([key, channel]) => channel.channelType === 'instance')
  if (activeChannelMatch && activeChannelMatch.length > 0) {
    activeChannel = activeChannelMatch[1]
  }
  const mediaState = useMediaInstanceConnectionState()
  const mediaHostId = Engine.instance.currentWorld.mediaNetwork?.hostId
  const mediaInstanceConnection = mediaHostId && mediaState.instances[mediaHostId].ornull

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

  // const toogleVRSession = () => {
  //   if (engineState.xrSessionStarted.value) {
  //     dispatchAction(XRAction.endSession({}))
  //   } else {
  //     dispatchAction(XRAction.requestSession({}))
  //   }
  // }

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

  const handleMicClick = async () => {
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    if (!mediaNetwork) return
    if (await configureMediaTransports(mediaNetwork, ['audio'])) {
      if (MediaStreams.instance.camAudioProducer == null) await createCamAudioProducer(mediaNetwork)
      else {
        const audioPaused = MediaStreams.instance.toggleAudioPaused()
        if (audioPaused) await pauseProducer(mediaNetwork, MediaStreams.instance.camAudioProducer)
        else await resumeProducer(mediaNetwork, MediaStreams.instance.camAudioProducer)
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
        {/* <WidgetButton
          Icon={VrIcon}
          toggle={toogleVRSession}
          label={engineState.xrSessionStarted.value ? 'Exit VR' : 'Enter VR'}
        /> */}
        {widgets.map(
          (widget, i) =>
            widget.enabled &&
            widget.icon && (
              <WidgetButton key={i} Icon={widget.icon} toggle={toggleWidget(widget)} label={widget.label} />
            )
        )}
        <WidgetButton Icon={RefreshIcon} toggle={handleRespawnAvatar} label={'Respawn'} />
        <WidgetButton
          disabled={!mediaInstanceConnection}
          Icon={MicIcon}
          toggle={handleMicClick}
          label={isCamAudioEnabled.value ? 'Audio on' : 'Audio Off'}
        />
      </div>
    </>
  )
}
