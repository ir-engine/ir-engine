import React, { useEffect, useState } from 'react'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformMode, TransformModeType } from '@xrengine/engine/src/scene/constants/transformConstants'

import HeightIcon from '@mui/icons-material/Height'
import OpenWithIcon from '@mui/icons-material/OpenWith'
import SyncIcon from '@mui/icons-material/Sync'

import { EditorControlComponent } from '../../../classes/EditorControlComponent'
import { SceneManager } from '../../../managers/SceneManager'
import { useModeState } from '../../../services/ModeServices'
import { setTransformMode } from '../../../systems/EditorControlSystem'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const TransformTool = () => {
  const modeState = useModeState()
  const [transformMode, changeTransformMode] = useState<TransformModeType>(TransformMode.Translate)

  useEffect(() => {
    updateTransformMode()
  }, [modeState.transformModeChanged])

  const updateTransformMode = () => {
    const editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    changeTransformMode(editorControlComponent.transformMode)
  }

  return (
    <div className={styles.toolbarInputGroup}>
      <InfoTooltip id="translate-button" info="[T] Translate" position="bottom">
        <button
          className={styles.toolButton + ' ' + (transformMode === TransformMode.Translate ? styles.selected : '')}
          onClick={() => setTransformMode(TransformMode.Translate)}
        >
          <OpenWithIcon fontSize="small" />
        </button>
      </InfoTooltip>
      <InfoTooltip id="rotate-button" info="[R] Rotate" position="bottom">
        <button
          className={styles.toolButton + ' ' + (transformMode === TransformMode.Rotate ? styles.selected : '')}
          onClick={() => setTransformMode(TransformMode.Rotate)}
        >
          <SyncIcon fontSize="small" />
        </button>
      </InfoTooltip>
      <InfoTooltip id="scale-button" info="[Y] Scale" position="bottom">
        <button
          className={styles.toolButton + ' ' + (transformMode === TransformMode.Scale ? styles.selected : '')}
          onClick={() => setTransformMode(TransformMode.Scale)}
        >
          <HeightIcon fontSize="small" />
        </button>
      </InfoTooltip>
    </div>
  )
}

export default TransformTool
