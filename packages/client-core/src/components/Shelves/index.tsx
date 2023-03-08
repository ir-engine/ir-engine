import React from 'react'

import { AudioEffectPlayer } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/Icon'
import IconButton from '@etherealengine/ui/src/IconButton'

import { AppAction, AppState } from '../../common/services/AppService'
import styles from './index.module.scss'

export const Shelves = () => {
  const appState = useHookstate(getMutableState(AppState))
  const showTopShelf = appState.showTopShelf.value
  const showBottomShelf = appState.showBottomShelf.value

  const handleShowMediaIcons = () => {
    dispatchAction(AppAction.showTopShelf({ show: !appState.showTopShelf.value }))
  }

  const handleShowBottomIcons = () => {
    dispatchAction(AppAction.showBottomShelf({ show: !appState.showBottomShelf.value }))
  }

  return (
    <div style={{ pointerEvents: 'auto' }}>
      <IconButton
        className={`${showTopShelf ? styles.btn : styles.smBtn} ${showTopShelf ? styles.rotate : styles.rotateBack} ${
          styles.showIconMedia
        } `}
        onClick={handleShowMediaIcons}
        onPointerDown={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        icon={<Icon type={showTopShelf ? 'KeyboardDoubleArrowUp' : 'KeyboardDoubleArrowDown'} />}
      />
      <IconButton
        className={`${showBottomShelf ? styles.btn : styles.smBtn} ${
          showBottomShelf ? styles.rotate : styles.rotateBack
        } ${styles.showIcon} `}
        onClick={handleShowBottomIcons}
        onPointerDown={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        icon={<Icon type={showBottomShelf ? 'KeyboardDoubleArrowDown' : 'KeyboardDoubleArrowUp'} />}
      />
    </div>
  )
}
