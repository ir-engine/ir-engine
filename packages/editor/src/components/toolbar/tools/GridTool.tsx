import React, { useEffect, useState } from 'react'

import GridOnIcon from '@mui/icons-material/GridOn'

import EditorEvents from '../../../constants/EditorEvents'
import { CommandManager } from '../../../managers/CommandManager'
import { SceneManager } from '../../../managers/SceneManager'
import NumericStepperInput from '../../inputs/NumericStepperInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const GridTool = () => {
  const [isGridVisible, setGridVisible] = useState(true)
  const [gridHeight, setGridHeight] = useState(0)

  useEffect(() => {
    CommandManager.instance.addListener(EditorEvents.GRID_HEIGHT_CHANGED.toString(), updateGridHeight)
    CommandManager.instance.addListener(EditorEvents.GRID_VISIBILITY_CHANGED.toString(), updateGridVisibility)

    return () => {
      CommandManager.instance.removeListener(EditorEvents.GRID_HEIGHT_CHANGED.toString(), updateGridHeight)
      CommandManager.instance.removeListener(EditorEvents.GRID_VISIBILITY_CHANGED.toString(), updateGridVisibility)
    }
  }, [])

  const updateGridVisibility = () => {
    setGridVisible(SceneManager.instance.grid.visible)
  }

  const updateGridHeight = () => {
    setGridHeight(SceneManager.instance.grid.position.y)
  }

  const onToggleGridVisible = () => {
    SceneManager.instance.grid.toggleGridVisible()
  }

  const onChangeGridHeight = (value) => {
    SceneManager.instance.grid.setGridHeight(value)
  }

  return (
    <div id="transform-grid" className={styles.toolbarInputGroup}>
      <InfoTooltip info="Toggle Grid Visibility">
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
