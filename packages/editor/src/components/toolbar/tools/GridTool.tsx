import React, { useEffect, useState } from 'react'

import GridOnIcon from '@mui/icons-material/GridOn'

import { SceneState } from '../../../functions/sceneRenderFunctions'
import { useGridToolState } from '../../../services/GridToolServices'
import NumericStepperInput from '../../inputs/NumericStepperInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const GridTool = () => {
  const gridToolState = useGridToolState().value
  const [isGridVisible, setGridVisible] = useState(gridToolState.visibility)
  const [gridHeight, setGridHeight] = useState(gridToolState.gridHeight)

  useEffect(() => {
    updateGridHeight(gridToolState.gridHeight)
  }, [gridToolState.gridHeight])

  useEffect(() => {
    updateGridVisibility(gridToolState.visibility)
  }, [gridToolState.visibility])

  const updateGridVisibility = (val) => {
    setGridVisible(val)
  }

  const updateGridHeight = (val) => {
    setGridHeight(val)
  }

  const onToggleGridVisible = () => {
    SceneState.grid.toggleGridVisible()
  }

  const onChangeGridHeight = (value) => {
    SceneState.grid.setGridHeight(value)
  }

  return (
    <div id="transform-grid" className={styles.toolbarInputGroup}>
      <InfoTooltip title="Toggle Grid Visibility">
        <button
          onClick={onToggleGridVisible}
          className={styles.toolButton + ' ' + (isGridVisible ? styles.selected : '')}
        >
          <GridOnIcon fontSize="small" />
        </button>
      </InfoTooltip>
      <NumericStepperInput
        className={styles.toolbarNumericStepperInput}
        value={gridHeight}
        onChange={onChangeGridHeight}
        precision={0.01}
        smallStep={0.5}
        mediumStep={1}
        largeStep={5}
        unit="m"
        incrementTooltip="[-] Increment Grid Height"
        decrementTooltip="[=] Decrement Grid Height"
      />
    </div>
  )
}

export default GridTool
