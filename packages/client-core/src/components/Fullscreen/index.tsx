import React from 'react'

import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'

import { FullscreenExit, ZoomOutMap } from '@mui/icons-material'

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
          <FullscreenExit />
        </button>
      ) : (
        <button
          type="button"
          className={`${styles.btn} ${styles.fullScreen} ${bottomShelfStyle} `}
          onClick={() => setFullScreenActive(true)}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        >
          <ZoomOutMap />
        </button>
      )}
    </>
  )
}
