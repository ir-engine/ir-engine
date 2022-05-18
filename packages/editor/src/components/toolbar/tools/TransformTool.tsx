import React from 'react'

import { TransformMode } from '@xrengine/engine/src/scene/constants/transformConstants'

import HeightIcon from '@mui/icons-material/Height'
import OpenWithIcon from '@mui/icons-material/OpenWith'
import SyncIcon from '@mui/icons-material/Sync'

import { setTransformMode } from '../../../functions/transformFunctions'
import { useEditorHelperState } from '../../../services/EditorHelperState'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const TransformTool = () => {
  const transformMode = useEditorHelperState().transformMode.value

  return (
    <div className={styles.toolbarInputGroup}>
      <InfoTooltip title="[T] Translate" placement="bottom">
        <button
          className={styles.toolButton + ' ' + (transformMode === TransformMode.Translate ? styles.selected : '')}
          onClick={() => setTransformMode(TransformMode.Translate)}
        >
          <OpenWithIcon fontSize="small" />
        </button>
      </InfoTooltip>
      <InfoTooltip title="[R] Rotate" placement="bottom">
        <button
          className={styles.toolButton + ' ' + (transformMode === TransformMode.Rotate ? styles.selected : '')}
          onClick={() => setTransformMode(TransformMode.Rotate)}
        >
          <SyncIcon fontSize="small" />
        </button>
      </InfoTooltip>
      <InfoTooltip title="[Y] Scale" placement="bottom">
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
