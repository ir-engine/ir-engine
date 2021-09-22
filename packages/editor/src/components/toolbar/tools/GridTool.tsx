import React, { useEffect, useState } from 'react'
import { Grid } from '@styled-icons/boxicons-regular/Grid'
import * as styles from '../styles.module.scss'
import { InfoTooltip } from '../../layout/Tooltip'
import NumericStepperInput from '../../inputs/NumericStepperInput'
import EditorEvents from '../../../constants/EditorEvents'
import { SceneManager } from '../../../managers/SceneManager'
import { CommandManager } from '../../../managers/CommandManager'

const GridTool = () => {
  const [temp, setTemp] = useState(0)

  useEffect(() => {
    CommandManager.instance.addListener(EditorEvents.GRID_HEIGHT_CHANGED.toString(), update)
    CommandManager.instance.addListener(EditorEvents.GRID_VISIBILITY_CHANGED.toString(), update)

    return () => {
      CommandManager.instance.removeListener(EditorEvents.GRID_HEIGHT_CHANGED.toString(), update)
      CommandManager.instance.removeListener(EditorEvents.GRID_VISIBILITY_CHANGED.toString(), update)
    }
  }, [])

  const update = () => {
    setTemp(temp + 1)
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
        <button onClick={onToggleGridVisible} className={styles.toggleButton}>
          <Grid size={16} />
        </button>
      </InfoTooltip>
      <NumericStepperInput
        className={styles.toolbarNumericStepperInput}
        value={SceneManager.instance.grid.position.y}
        onChange={onChangeGridHeight}
        precision={0.01}
        smallStep={0.25}
        mediumStep={1.5}
        largeStep={4.5}
        unit="m"
        incrementTooltip="[-] Increment Grid Height"
        decrementTooltip="[=] Decrement Grid Height"
      />
    </div>
  )
}

export default GridTool
