import React, { useEffect, useState } from 'react'
import { Pause } from '@styled-icons/fa-solid/Pause'
import { Play } from '@styled-icons/fa-solid/Play'
import { ControlManager } from '../../../managers/ControlManager'
import { CommandManager } from '../../../managers/CommandManager'
import EditorEvents from '../../../constants/EditorEvents'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const PlayModeTool = () => {
  const [isInPlayMode, setInPlayMode] = useState(false)

  useEffect(() => {
    CommandManager.instance.addListener(EditorEvents.PLAY_MODE_CHANGED.toString(), updatePlayModeSetting)

    return () => {
      CommandManager.instance.removeListener(EditorEvents.PLAY_MODE_CHANGED.toString(), updatePlayModeSetting)
    }
  }, [])

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
        <button onClick={onTogglePlayMode} className={styles.toolButton + ' ' + (isInPlayMode ? styles.selected : '')}>
          {isInPlayMode ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </InfoTooltip>
    </div>
  )
}

export default PlayModeTool
