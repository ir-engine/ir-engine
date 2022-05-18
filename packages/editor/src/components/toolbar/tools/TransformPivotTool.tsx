import React from 'react'

import { TransformPivot } from '@xrengine/engine/src/scene/constants/transformConstants'

import AdjustIcon from '@mui/icons-material/Adjust'

import { setTransformPivot, toggleTransformPivot } from '../../../functions/transformFunctions'
import { useModeState } from '../../../services/ModeServices'
import SelectInput from '../../inputs/SelectInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

/**
 *
 * @author Robert Long
 */
const transformPivotOptions = [
  { label: 'Selection', value: TransformPivot.Selection },
  { label: 'Center', value: TransformPivot.Center },
  { label: 'Bottom', value: TransformPivot.Bottom }
]

const TransformPivotTool = () => {
  const modeState = useModeState()

  return (
    <div className={styles.toolbarInputGroup} id="transform-pivot">
      <InfoTooltip title="[X] Toggle Transform Pivot">
        <button onClick={toggleTransformPivot as any} className={styles.toolButton}>
          <AdjustIcon fontSize="small" />
        </button>
      </InfoTooltip>
      <SelectInput
        key={modeState.transformPivot.value}
        className={styles.selectInput}
        onChange={setTransformPivot}
        options={transformPivotOptions}
        value={modeState.transformPivot.value}
        creatable={false}
        isSearchable={false}
      />
    </div>
  )
}

export default TransformPivotTool
