import { useHookstate } from '@hookstate/core'
import React from 'react'

import { TransformPivot } from '@etherealengine/engine/src/scene/constants/transformConstants'
import { getMutableState } from '@etherealengine/hyperflux'

import AdjustIcon from '@mui/icons-material/Adjust'

import { setTransformPivot, toggleTransformPivot } from '../../../functions/transformFunctions'
import { EditorHelperState } from '../../../services/EditorHelperState'
import SelectInput from '../../inputs/SelectInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const transformPivotOptions = [
  { label: 'Selection', value: TransformPivot.Selection },
  { label: 'Center', value: TransformPivot.Center },
  { label: 'Bottom', value: TransformPivot.Bottom },
  { label: 'Origin', value: TransformPivot.Origin }
]

const TransformPivotTool = () => {
  const editorHelperState = useHookstate(getMutableState(EditorHelperState))

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
