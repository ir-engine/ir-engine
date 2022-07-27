import React from 'react'

import { TransformPivot } from '@xrengine/engine/src/scene/constants/transformConstants'

import AdjustIcon from '@mui/icons-material/Adjust'

import { setTransformPivot, toggleTransformPivot } from '../../../functions/transformFunctions'
import { useEditorHelperState } from '../../../services/EditorHelperState'
import SelectInput from '../../inputs/SelectInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const transformPivotOptions = [
  { label: 'Selection', value: TransformPivot.Selection },
  { label: 'Center', value: TransformPivot.Center },
  { label: 'Bottom', value: TransformPivot.Bottom }
]

const TransformPivotTool = () => {
  const editorHelperState = useEditorHelperState()

  return (
    <div className={styles.toolbarInputGroup} id="transform-pivot">
      <InfoTooltip title="[X] Toggle Transform Pivot">
        <button onClick={toggleTransformPivot as any} className={styles.toolButton}>
          <AdjustIcon fontSize="small" />
        </button>
      </InfoTooltip>
      <SelectInput
        key={editorHelperState.transformPivot.value}
        className={styles.selectInput}
        onChange={setTransformPivot}
        options={transformPivotOptions}
        value={editorHelperState.transformPivot.value}
        creatable={false}
        isSearchable={false}
      />
    </div>
  )
}

export default TransformPivotTool
