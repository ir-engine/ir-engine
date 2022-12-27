import React from 'react'

import { getEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { dispatchAction } from '@xrengine/hyperflux'

import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

import { cancelGrabOrPlacement } from '../../../functions/cancelGrabOrPlacement'
import { EditorControlFunctions } from '../../../functions/EditorControlFunctions'
import { EditorAction, useEditorState } from '../../../services/EditorServices'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const PlayModeTool = () => {
  const editorState = useEditorState()

  const onToggleVisibility = () => {
    if (editorState.visible.value) {
      cancelGrabOrPlacement()
      EditorControlFunctions.replaceSelection([])
      dispatchAction(EditorAction.toggleVisible({ visible: false }))
    }
  }

  const sceneLoaded = getEngineState().sceneLoaded.value

  return (
    <div className={styles.toolbarInputGroup + ' ' + styles.playButtonContainer} id="preview">
      <InfoTooltip title={'Hide Editor'}>
        <button disabled={!sceneLoaded} onClick={onToggleVisibility} className={styles.toolButton}>
          <VisibilityOffIcon fontSize="small" />
        </button>
      </InfoTooltip>
    </div>
  )
}

export default PlayModeTool
