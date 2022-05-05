import React, { useEffect, useState } from 'react'

import { useEngineRendererState } from '@xrengine/engine/src/renderer/EngineRendererState'
import InfiniteGridHelper from '@xrengine/engine/src/scene/classes/InfiniteGridHelper'

import GridOnIcon from '@mui/icons-material/GridOn'

import NumericStepperInput from '../../inputs/NumericStepperInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const GridTool = () => {
  const engineRendererState = useEngineRendererState().value
  const [isGridVisible, setGridVisible] = useState(engineRendererState.gridVisibility)
  const [gridHeight, setGridHeight] = useState(engineRendererState.gridHeight)

  useEffect(() => {
    updateGridHeight(engineRendererState.gridHeight)
  }, [engineRendererState.gridHeight])

  useEffect(() => {
    updateGridVisibility(engineRendererState.gridVisibility)
  }, [engineRendererState.gridVisibility])

  const updateGridVisibility = (val) => {
    setGridVisible(val)
  }

  const updateGridHeight = (val) => {
    setGridHeight(val)
  }

  const onToggleGridVisible = () => {
    InfiniteGridHelper.instance.toggleGridVisible()
  }

  const onChangeGridHeight = (value) => {
    InfiniteGridHelper.instance.setGridHeight(value)
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
