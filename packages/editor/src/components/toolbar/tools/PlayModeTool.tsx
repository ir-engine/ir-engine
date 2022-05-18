import React from 'react'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

import { enterPlayMode, leavePlayMode } from '../../../controls/PlayModeControls'
import { useModeState } from '../../../services/ModeServices'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const PlayModeTool = () => {
  const modeState = useModeState()

  const onTogglePlayMode = () => {
    if (modeState.isPlayModeEnabled.value) {
      leavePlayMode()
    } else {
      enterPlayMode()
    }
  }

  return (
    <div className={styles.toolbarInputGroup + ' ' + styles.playButtonContainer} id="preview">
      <InfoTooltip title={modeState.isPlayModeEnabled.value ? 'Stop Previewing Scene' : 'Preview Scene'}>
        <button
          disabled={!Engine.sceneLoaded}
          onClick={onTogglePlayMode}
          className={styles.toolButton + ' ' + (modeState.isPlayModeEnabled.value ? styles.selected : '')}
        >
          {modeState.isPlayModeEnabled.value ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
        </button>
      </InfoTooltip>
    </div>
  )
}

export default PlayModeTool
