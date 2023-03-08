import React from 'react'

import { AudioEffectPlayer } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import Icon from '@etherealengine/ui/src/Icon'
import IconButton from '@etherealengine/ui/src/IconButton'

import { useShelfStyles } from '../Shelves/useShelfStyles'
import { useFullscreen } from '../useFullscreen'
import styles from './index.module.scss'

export const Fullscreen = () => {
  const [fullScreenActive, setFullScreenActive] = useFullscreen()
  const { bottomShelfStyle } = useShelfStyles()
  return (
    <>
      {fullScreenActive ? (
        <IconButton
          className={`${styles.btn} ${styles.fullScreen} ${bottomShelfStyle} `}
          onClick={() => setFullScreenActive(false)}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          icon={<Icon type="FullscreenExit" />}
        />
      ) : (
        <IconButton
          className={`${styles.btn} ${styles.fullScreen} ${bottomShelfStyle} `}
          onClick={() => setFullScreenActive(true)}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          icon={<Icon type="ZoomOutMap" />}
        />
      )}
    </>
  )
}
