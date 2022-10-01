import React from 'react'
import { useTranslation } from 'react-i18next'

import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { XRState } from '@xrengine/engine/src/xr/XRState'
import { getState, useHookstate } from '@xrengine/hyperflux'

import LocationSearchingIcon from '@mui/icons-material/LocationSearching'

import { useShelfStyles } from '../Shelves/useShelfStyles'
import styles from './index.module.scss'

export const ARPlacement = () => {
  const { topShelfStyle } = useShelfStyles()
  const { t } = useTranslation()

  const engineState = useEngineState()
  const xrState = useHookstate(getState(XRState))
  const supportsAR = xrState.supportedSessionModes['immersive-ar'].value
  const xrSessionActive = xrState.sessionActive.value
  const inPlacementMode = xrState.scenePlacementMode.value
  if (!supportsAR || !engineState.sceneLoaded.value || !xrSessionActive) return <></>

  const place = () => {
    xrState.scenePlacementMode.set((val) => !val)
  }

  return (
    <div style={{ top: inPlacementMode ? '50%' : '12px' }} className={`${styles.drawerBox} ${topShelfStyle}`}>
      <button
        type="button"
        id="UserXR"
        className={styles.iconContainer + ' ' + (inPlacementMode ? styles.on : '')}
        onClick={place}
        onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
      >
        <LocationSearchingIcon />
        <div style={{ margin: '3px' }}>{inPlacementMode ? t('common:ar.done') : t('common:ar.placeScene')}</div>
      </button>
    </div>
  )
}
