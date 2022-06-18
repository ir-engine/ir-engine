import { createState } from '@speigg/hookstate'
import React, { useEffect, useState } from 'react'

import { VrIcon } from '@xrengine/client-core/src/common/components/Icons/Vricon'
import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { respawnAvatar } from '@xrengine/engine/src/avatar/functions/respawnAvatar'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useWidgetAppState, WidgetAppActions } from '@xrengine/engine/src/xrui/WidgetAppService'
import { dispatchAction } from '@xrengine/hyperflux'

import RefreshIcon from '@mui/icons-material/Refresh'

import { useChatState } from '../../social/services/ChatService'
import { MainMenuButtonState } from '../state/MainMenuButtonState'

const styles = {
  container: {
    display: 'grid',
    gridGap: '10px'
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

type WidgetButtonProps = {
  Icon: any
  toggle: () => any
  label: string
}

const WidgetButton = ({ Icon, toggle, label }: WidgetButtonProps) => {
  const [mouseOver, setMouseOver] = useState(false)
  return (
    <div
      style={styles.button}
      onClick={toggle}
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
    >
      <Icon className="svgIcon" />
      {mouseOver && <div>{label}</div>}
    </div>
  )
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

  const widgets = Object.entries(useWidgetAppState().value).map(([id, widgetState]) => ({
    id,
    ...widgetState,
    ...Engine.instance.currentWorld.widgets.get(id)!
  }))

  console.log(widgets)

  const toggleWidget = (widget) => () => {
    dispatchAction(WidgetAppActions.showWidget({ id: widget.id, shown: !widget.visible }))
  }

  if (!MainMenuButtonState.showButtons.value) return null!

  return (
    <div
      style={{
        ...styles.container,
        gridTemplateColumns: '1fr 1fr' + widgets.map(() => ' 1fr').flat()
      }}
      xr-layer="true"
    >
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
      <div style={styles.button} onClick={toogleVRSession}>
        <VrIcon />
      </div>
      {widgets.map(
        (widget, i) =>
          widget.enabled && (
            <WidgetButton key={i} Icon={widget.icon} toggle={toggleWidget(widget)} label={widget.label} />
          )
      )}
    </div>
  )
}
