import React from 'react'
import { useTranslation } from 'react-i18next'

import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { XRAction, XRState } from '@xrengine/engine/src/xr/XRState'
import { dispatchAction, getState, useHookstate } from '@xrengine/hyperflux'

import AnchorIcon from '@mui/icons-material/Anchor'

import { AppAction } from '../../common/services/AppService'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import styles from './index.module.scss'

export const ARPlacement = () => {
  const { bottomShelfStyle } = useShelfStyles()
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
        active: !inPlacementMode
      })
    )
    dispatchAction(AppAction.showTopShelf({ show: false }))
    dispatchAction(AppAction.showBottomShelf({ show: false }))
  }

  return (
    <div className={`${styles.arPlacement} ${inPlacementMode ? `` : bottomShelfStyle}`}>
      <button
        type="button"
        id="UserXR"
        className={styles.iconContainer + ' ' + (inPlacementMode ? styles.on : '')}
        onClick={place}
        onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
      >
        {!inPlacementMode && <AnchorIcon />}
        <div style={{ margin: '3px' }}>{inPlacementMode ? t('common:ar.done') : t('common:ar.placeScene')}</div>
      </button>
    </div>
  )
}
