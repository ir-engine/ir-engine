import React, { useEffect, useState } from 'react'
import { Grid } from '@styled-icons/boxicons-regular/Grid'
import * as styles from '../styles.module.scss'
import { InfoTooltip } from '../../layout/Tooltip'
import NumericStepperInput from '../../inputs/NumericStepperInput'
import { SceneManager } from '../../../managers/SceneManager'

const GridTool = () => {
  const [isGridVisible, setGridVisible] = useState(true)
  const [gridHeight, setGridHeight] = useState(0)

  const onToggleGridVisible = () => {
    SceneManager.instance.grid.toggleGridVisible()
    setGridVisible(SceneManager.instance.grid.visible)
  }

  const onChangeGridHeight = (value) => {
    SceneManager.instance.grid.setGridHeight(value)
    setGridHeight(SceneManager.instance.grid.position.y)
  }

  return (
    <div id="transform-grid" className={styles.toolbarInputGroup}>
      <InfoTooltip info="Toggle Grid Visibility">
        <button
          onClick={onToggleGridVisible}
          className={styles.toolButton + ' ' + (isGridVisible ? styles.selected : '')}
        >
          <Grid size={16} />
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
