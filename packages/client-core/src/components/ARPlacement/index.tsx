import React from 'react'
import { useTranslation } from 'react-i18next'

import { AudioEffectPlayer } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { XRState } from '@etherealengine/engine/src/xr/XRState'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/Icon'

import { AppAction } from '../../common/services/AppService'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import styles from './index.module.scss'

export const ARPlacement = () => {
  const { bottomShelfStyle } = useShelfStyles()
  const { t } = useTranslation()

  const engineState = useEngineState()
  const xrState = useHookstate(getMutableState(XRState))
  const supportsAR = xrState.supportedSessionModes['immersive-ar'].value
  const xrSessionActive = xrState.sessionActive.value
  if (!supportsAR || !engineState.sceneLoaded.value || !xrSessionActive) return <></>

  const inPlacingMode = xrState.scenePlacementMode.value === 'placing'

  const place = () => {
    xrState.scenePlacementMode.set(xrState.scenePlacementMode.value === 'placing' ? 'placed' : 'placing')
    dispatchAction(AppAction.showTopShelf({ show: false }))
    dispatchAction(AppAction.showBottomShelf({ show: false }))
  }

  return (
    <div className={`${styles.arPlacement} ${inPlacingMode ? `` : bottomShelfStyle}`}>
      <button
        type="button"
        id="UserXR"
        className={styles.iconContainer + ' ' + (inPlacingMode ? styles.on : '')}
        onClick={place}
        onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
      >
        {!inPlacingMode && <Icon type="Anchor" />}
        <div style={{ margin: '3px' }}>{inPlacingMode ? t('common:ar.done') : t('common:ar.placeScene')}</div>
      </button>
    </div>
  )
}
