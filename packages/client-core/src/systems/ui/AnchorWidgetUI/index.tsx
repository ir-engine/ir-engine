import { useHookstate } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { XRAction, XRState } from '@xrengine/engine/src/xr/XRState'
import { dispatchAction, getState } from '@xrengine/hyperflux'

import AnchorIcon from '@mui/icons-material/Anchor'

import styles from './index.module.scss?inline'

export const AnchorWidgetUI = () => {
  const { t } = useTranslation()

  const engineState = useEngineState()
  const xrState = useHookstate(getState(XRState))
  const supportsAR = xrState.supportedSessionModes['immersive-ar'].value
  const xrSessionActive = xrState.sessionActive.value
  const inPlacementMode = xrState.scenePlacementMode.value
  if (!supportsAR || !engineState.sceneLoaded.value || !xrSessionActive) return <></>

  const place = () => {
    dispatchAction(
      XRAction.changePlacementMode({
        active: true
      })
    )
  }

  if (inPlacementMode) return <></>

  return (
    <>
      <style>{styles}</style>
      <div className="arPlacement">
        <button
          type="button"
          id="UserXR"
          className={'iconContainer'}
          onClick={place}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        >
          <AnchorIcon />
          <div style={{ margin: '3px' }}>{t('common:ar.placeScene')}</div>
        </button>
      </div>
    </>
  )
}
