/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'

// import { VrIcon } from '../../../common/components/Icons/VrIcon'
import { respawnAvatar } from '@etherealengine/engine/src/avatar/functions/respawnAvatar'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { RegisteredWidgets, WidgetAppActions, WidgetAppState } from '@etherealengine/engine/src/xrui/WidgetAppService'
import { createState, dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { AvatarInputSettingsState } from '@etherealengine/engine/src/avatar/state/AvatarInputSettingsState'
import { XRState } from '@etherealengine/engine/src/xr/XRState'
import { setTrackingSpace } from '../../../../../engine/src/xr/XRScaleAdjustmentFunctions'
import { useMediaInstance } from '../../../common/services/MediaInstanceConnectionService'
import { MediaStreamState } from '../../../transports/MediaStreams'
import { toggleMicrophonePaused } from '../../../transports/SocketWebRTCClientFunctions'
import XRIconButton from '../../components/XRIconButton'
import HandSVG from './back_hand_24px.svg?react'
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

const WidgetButton = ({ icon, toggle, label, disabled }: WidgetButtonProps) => {
  const mouseOver = useHookstate(false)
  return (
    <XRIconButton
      disabled={disabled}
      size="large"
      content={
        <>
          {<Icon type={icon} className="svgIcon" />}
          {mouseOver.value && <div>{label}</div>}
        </>
      }
      onClick={toggle}
      onMouseEnter={() => mouseOver.set(true)}
      onMouseLeave={() => mouseOver.set(false)}
      xr-layer="true"
    />
  )
}

const HandednessWidgetButton = () => {
  const preferredHand = useHookstate(getMutableState(AvatarInputSettingsState).preferredHand)
  const mouseOver = useHookstate(false)
  return (
    <XRIconButton
      disabled={false}
      size="large"
      content={
        mouseOver.value ? (
          <div>{preferredHand.value === 'left' ? 'Left' : 'Right'}</div>
        ) : (
          <>
            <div style={{ transform: `scaleX(${preferredHand.value === 'right' ? -1 : 1})` }}>
              <HandSVG />
            </div>
            <div
              style={{
                color: 'var(--iconButtonBackground)',
                position: 'absolute',
                fontSize: '10px'
              }}
            >
              {preferredHand.value === 'left' ? 'L' : 'R'}
            </div>
          </>
        )
      }
      onClick={() => preferredHand.set((val) => (val === 'left' ? 'right' : 'left'))}
      onMouseEnter={() => mouseOver.set(true)}
      onMouseLeave={() => mouseOver.set(false)}
      xr-layer="true"
    />
  )
}

const WidgetButtons = () => {
  const widgetMutableState = useHookstate(getMutableState(WidgetAppState))
  const sessionMode = useHookstate(getMutableState(XRState).sessionMode)
  const mediaInstanceState = useMediaInstance()

  const mediaStreamState = useHookstate(getMutableState(MediaStreamState))
  const isCamAudioEnabled = mediaStreamState.camAudioProducer.value != null && !mediaStreamState.audioPaused.value

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
  //     endXRSession()
  //   } else {
  //     requestXRSession()
  //   }
  // }

  const handleRespawnAvatar = () => {
    respawnAvatar(Engine.instance.localClientEntity)
  }

  const handleHeightAdjustment = () => {
    setTrackingSpace()
  }

  const widgets = Object.entries(widgetMutableState.widgets.value).map(([id, widgetMutableState]) => ({
    id,
    ...widgetMutableState,
    ...RegisteredWidgets.get(id)!
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
        {sessionMode.value !== 'none' && (
          <WidgetButton icon="Person" toggle={handleHeightAdjustment} label={'Reset Height'} />
        )}
        <HandednessWidgetButton />
        {mediaInstanceState?.value && (
          <WidgetButton
            icon={isCamAudioEnabled ? 'Mic' : 'MicOff'}
            toggle={toggleMicrophonePaused}
            label={isCamAudioEnabled ? 'Audio on' : 'Audio Off'}
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
