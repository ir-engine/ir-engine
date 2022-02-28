import React, { useEffect, useState } from 'react'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

import { ControlManager } from '../../../managers/ControlManager'
import { useModeState } from '../../../services/ModeServices'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const PlayModeTool = () => {
  const modeState = useModeState()
  const initializeRef = React.useRef<boolean>(false)
  const [isInPlayMode, setInPlayMode] = useState(false)

  useEffect(() => {
    if (initializeRef.current) {
      updatePlayModeSetting()
    } else {
      initializeRef.current = true
    }
  }, [modeState.playModeChanged])

  const updatePlayModeSetting = () => {
    setInPlayMode(ControlManager.instance.isInPlayMode)
  }

  const onTogglePlayMode = () => {
    if (isInPlayMode) {
      ControlManager.instance.leavePlayMode()
    } else {
      ControlManager.instance.enterPlayMode()
    }
  }

  return (
    <div className={styles.toolbarInputGroup + ' ' + styles.playButtonContainer} id="preview">
      <InfoTooltip info={isInPlayMode ? 'Stop Previewing Scene' : 'Preview Scene'}>
        <button
          disabled={!Engine.sceneLoaded}
          onClick={onTogglePlayMode}
          className={styles.toolButton + ' ' + (isInPlayMode ? styles.selected : '')}
        >
          {isInPlayMode ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
        </button>
      </InfoTooltip>
    </div>
  )
}

export default PlayModeTool
