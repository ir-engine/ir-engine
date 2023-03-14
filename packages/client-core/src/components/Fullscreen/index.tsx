import React from 'react'

import { AudioEffectPlayer } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import Icon from '@etherealengine/ui/src/Icon'

import { useShelfStyles } from '../Shelves/useShelfStyles'
import { useFullscreen } from '../useFullscreen'
import styles from './index.module.scss'

export const Fullscreen = () => {
  const [fullScreenActive, setFullScreenActive] = useFullscreen()
  const { bottomShelfStyle } = useShelfStyles()
  return (
    <>
      {fullScreenActive ? (
        <button
          type="button"
          className={`${styles.btn} ${styles.fullScreen} ${bottomShelfStyle} `}
          onClick={() => setFullScreenActive(false)}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        >
          <Icon type="FullscreenExit" />
        </button>
      ) : (
        <button
          type="button"
          className={`${styles.btn} ${styles.fullScreen} ${bottomShelfStyle} `}
          onClick={() => setFullScreenActive(true)}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        >
          <Icon type="ZoomOutMap" />
        </button>
      )}
    </>
  )
}
