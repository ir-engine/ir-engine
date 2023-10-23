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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { AudioEffectPlayer } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { XRState } from '@etherealengine/engine/src/xr/XRState'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { AppState } from '../../common/services/AppService'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import styles from './index.module.scss'

let lastX = 0

const AxisComponent = () => {
  const fingerDown = useHookstate(false)
  const sceneScaleAutoMode = useHookstate(getMutableState(XRState).sceneScaleAutoMode)

  const handleXAxisTouch = (e: TouchEvent) => {
    const scenePlacementMode = getState(XRState).scenePlacementMode
    if (scenePlacementMode !== 'placing') return

    if (lastX) {
      // screen width range from 0 to 360 degrees in radians, add delta where one whole swipe is a rotation
      const touchXDelta = ((lastX - e.touches[0].clientX) / window.innerWidth) * Math.PI
      getMutableState(XRState).sceneRotationOffset.set((currentValue) => currentValue + touchXDelta)
    }
    lastX = e.touches[0].clientX

    if (!getState(XRState).sceneScaleAutoMode) {
      const touchY = e.touches[0].clientY / window.innerHeight
      getMutableState(XRState).sceneScaleTarget.set(touchY * touchY * 0.19 + 0.01) // exponentially scale from 0.01 to 0.2
    }
  }

  useEffect(() => {
    window.addEventListener('touchmove', handleXAxisTouch, false)

    const handleFingerDown = () => fingerDown.set(true)
    const handleFingerUp = () => {
      fingerDown.set(false)
      lastX = 0
    }

    window.addEventListener('touchstart', handleFingerDown)
    window.addEventListener('touchend', handleFingerUp)
    return () => {
      window.removeEventListener('touchmove', handleXAxisTouch)
      window.removeEventListener('touchstart', handleFingerDown)
      window.removeEventListener('touchend', handleFingerUp)
    }
  }, [])

  return (
    <div
      style={{
        transition: 'all 0.6s ease',
        opacity: fingerDown.value ? 1 : 0,
        transform: fingerDown.value ? 'scale(1)' : 'scale(0.8)',
        display: 'flex',
        pointerEvents: 'none',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Y-axis on the left */}
      {sceneScaleAutoMode && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '10%',
            height: '80%',
            width: '1px',
            backgroundColor: 'lightgray',
            zIndex: 1
          }}
        />
      )}

      {/* X-axis in the middle */}
      <div
        style={{
          position: 'absolute',
          left: '10%',
          top: '50%',
          width: '80%',
          height: '1px',
          backgroundColor: 'lightgray',
          zIndex: 1
        }}
      />
    </div>
  )
}

export const ARPlacement = () => {
  const { bottomShelfStyle } = useShelfStyles()
  const { t } = useTranslation()

  const engineState = useHookstate(getMutableState(EngineState))
  const xrState = useHookstate(getMutableState(XRState))
  const isARSession = xrState.sessionMode.value === 'immersive-ar'
  if (!isARSession || !engineState.sceneLoaded.value) return <></>

  const inPlacingMode = xrState.scenePlacementMode.value === 'placing'
  const isAutoScaleMode = xrState.sceneScaleAutoMode.value

  const place = () => {
    xrState.scenePlacementMode.set(xrState.scenePlacementMode.value === 'placing' ? 'placed' : 'placing')
    getMutableState(AppState).merge({ showTopShelf: false, showBottomShelf: false })
  }

  const toggleAuto = () => {
    xrState.sceneScaleAutoMode.set(!xrState.sceneScaleAutoMode.value)
  }

  return (
    <>
      {inPlacingMode && <AxisComponent />}
      <div className={`${styles.arPlacement} ${inPlacingMode ? `` : bottomShelfStyle}`}>
        {inPlacingMode && (
          <button
            type="button"
            id="Placement Auto"
            className={styles.iconContainer + ' ' + (isAutoScaleMode ? styles.on : '')}
            onClick={toggleAuto}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            {/* <Icon type="Scale" /> */}
            <div style={{ margin: '3px' }}>{t('common:ar.auto')}</div>
          </button>
        )}
        <button
          type="button"
          id="Placement Done"
          className={styles.iconContainer + ' ' + (inPlacingMode ? styles.on : '')}
          onClick={place}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        >
          {!inPlacingMode && <Icon type="Anchor" />}
          <div style={{ margin: '3px' }}>{inPlacingMode ? t('common:ar.done') : t('common:ar.placeScene')}</div>
        </button>
      </div>
    </>
  )
}
