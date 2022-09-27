import React from 'react'

import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { dispatchAction, getState, useHookstate } from '@xrengine/hyperflux'

import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown'
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp'

import { AppAction, AppState } from '../../common/services/AppService'
import styles from './index.module.scss'

export const Shelves = () => {
  const appState = useHookstate(getState(AppState))
  const showTopShelf = appState.showTopShelf.value
  const showBottomShelf = appState.showBottomShelf.value

  const handleShowMediaIcons = () => {
    dispatchAction(AppAction.showTopShelf({ show: !appState.showTopShelf.value }))
  }

  const handleShowBottomIcons = () => {
    dispatchAction(AppAction.showBottomShelf({ show: !appState.showBottomShelf.value }))
  }

  const MediaIconHider = showTopShelf ? KeyboardDoubleArrowUpIcon : KeyboardDoubleArrowDownIcon
  const BottomIconHider = showBottomShelf ? KeyboardDoubleArrowDownIcon : KeyboardDoubleArrowUpIcon

  return (
    <div style={{ pointerEvents: 'auto' }}>
      <button
        type="button"
        className={`${showTopShelf ? styles.btn : styles.smBtn} ${showTopShelf ? styles.rotate : styles.rotateBack} ${
          styles.showIconMedia
        } `}
        onClick={handleShowMediaIcons}
        onPointerDown={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
      >
        <MediaIconHider />
      </button>
      <button
        type="button"
        className={`${showBottomShelf ? styles.btn : styles.smBtn} ${
          showBottomShelf ? styles.rotate : styles.rotateBack
        } ${styles.showIcon} `}
        onClick={handleShowBottomIcons}
        onPointerDown={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
      >
        <BottomIconHider />
      </button>
    </div>
  )
}
