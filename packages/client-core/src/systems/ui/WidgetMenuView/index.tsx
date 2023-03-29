import { createState, useHookstate } from '@hookstate/core'
import React, { useState } from 'react'

// import { VrIcon } from '../../../common/components/Icons/VrIcon'
import { Channel } from '@etherealengine/common/src/interfaces/Channel'
import { respawnAvatar } from '@etherealengine/engine/src/avatar/functions/respawnAvatar'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { WidgetAppActions, WidgetAppState } from '@etherealengine/engine/src/xrui/WidgetAppService'
import { dispatchAction, getMutableState } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { useMediaInstance } from '../../../common/services/MediaInstanceConnectionService'
import { useMediaStreamState } from '../../../media/services/MediaStreamService'
import { useChatState } from '../../../social/services/ChatService'
import { toggleMicrophonePaused } from '../../../transports/SocketWebRTCClientFunctions'
import XRIconButton from '../../components/XRIconButton'
import styleString from './index.scss?inline'

export function createWidgetButtonsView() {
  return createXRUI(WidgetButtons, createWidgetButtonsState())
}

function createWidgetButtonsState() {
  return createState({})
}

type WidgetButtonProps = {
  icon: any
  toggle: () => any
  label: string
  disabled?: boolean
}

const WidgetButton = ({ icon: name, toggle, label, disabled }: WidgetButtonProps) => {
  const [mouseOver, setMouseOver] = useState(false)
  return (
    <XRIconButton
      disabled={disabled}
      size="large"
      content={
        <>
          <Icon type={name} className="svgIcon" />
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
  const widgetMutableState = useHookstate(getMutableState(WidgetAppState))
  const channelState = chatState.channels
  const channels = channelState.channels.value as Channel[]
  const activeChannelMatch = Object.entries(channels).find(([key, channel]) => channel.channelType === 'instance')
  if (activeChannelMatch && activeChannelMatch.length > 0) {
    activeChannel = activeChannelMatch[1]
  }
  const mediaInstanceState = useMediaInstance()

  const channelEntries = Object.values(channels).filter((channel) => !!channel) as any
  const instanceChannel = channelEntries.find((entry) => entry.instanceId === Engine.instance.worldNetwork?.hostId)
  const mediastream = useMediaStreamState()
  const isCamAudioEnabled = mediastream.isCamAudioEnabled

  // TODO: add a notification hint function to the widget wrapper and move unread messages there
  // useEffect(() => {
  //   activeChannel &&
  //     activeChannel.messages &&
  //     activeChannel.messages.length > 0 &&
  //     !widgetMutableState.chatMenuOpen.value &&
  //     setUnreadMessages(true)
  // }, [activeChannel?.messages])

  // const toggleVRSession = () => {
  //   if (engineState.xrSessionStarted.value) {
  //     dispatchAction(XRAction.endSession({}))
  //   } else {
  //     dispatchAction(XRAction.requestSession({}))
  //   }
  // }

  const handleRespawnAvatar = () => {
    respawnAvatar(Engine.instance.localClientEntity)
  }

  const widgets = Object.entries(widgetMutableState.widgets.value).map(([id, widgetMutableState]) => ({
    id,
    ...widgetMutableState,
    ...Engine.instance.widgets.get(id)!
  }))

  const toggleWidget = (toggledWidget) => () => {
    const state = widgetMutableState.widgets.value
    const visible = state[toggledWidget.id].visible
    // close currently open widgets until we support multiple widgets being open at once
    if (!visible) {
      Object.entries(state).forEach(([id, widget]) => {
        if (widget.visible && id !== toggledWidget.id) dispatchAction(WidgetAppActions.showWidget({ id, shown: false }))
      })
    }
    dispatchAction(WidgetAppActions.showWidget({ id: toggledWidget.id, shown: !visible }))
  }

  const activeWidgets = widgets.filter((widget) => widget.enabled && widget.icon)

  const additionalWidgetCount = 1 + (mediaInstanceState?.value ? 1 : 0)
  const gridTemplateColumns = new Array(additionalWidgetCount)
    .fill('1fr')
    .concat(activeWidgets.map(() => ' 1fr'))
    .join(' ')

  return (
    <>
      <style>{styleString}</style>
      <div className="container" style={{ gridTemplateColumns }} xr-pixel-ratio="8" xr-layer="true">
        <WidgetButton icon="Refresh" toggle={handleRespawnAvatar} label={'Respawn'} />
        {mediaInstanceState?.value && (
          <WidgetButton
            icon={isCamAudioEnabled.value ? 'Mic' : 'MicOff'}
            toggle={toggleMicrophonePaused}
            label={isCamAudioEnabled.value ? 'Audio on' : 'Audio Off'}
          />
        )}
        {/* <WidgetButton
          Icon={VrIcon}
          toggle={toggleVRSession}
          label={engineState.xrSessionStarted.value ? 'Exit VR' : 'Enter VR'}
        /> */}
        {activeWidgets.map((widget, i) => (
          <WidgetButton key={i} icon={widget.icon} toggle={toggleWidget(widget)} label={widget.label} />
        ))}
      </div>
    </>
  )
}
