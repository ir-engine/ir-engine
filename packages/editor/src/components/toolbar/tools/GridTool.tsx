import React from 'react'

import { RendererState } from '@etherealengine/engine/src/renderer/RendererState'
import InfiniteGridHelper from '@etherealengine/engine/src/scene/classes/InfiniteGridHelper'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import GridOnIcon from '@mui/icons-material/GridOn'

import NumericStepperInput from '../../inputs/NumericStepperInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const GridTool = () => {
  const rendererState = useHookstate(getMutableState(RendererState))

  const onToggleGridVisible = () => {
    rendererState.gridVisibility.set(!rendererState.gridVisibility.value)
  }

  const onChangeGridHeight = (value) => {
    InfiniteGridHelper.instance.setGridHeight(value)
  }

  return (
    <div id="transform-grid" className={styles.toolbarInputGroup}>
      <InfoTooltip title="Toggle Grid Visibility">
        <button
          onClick={onToggleGridVisible}
          className={styles.toolButton + ' ' + (rendererState.gridVisibility ? styles.selected : '')}
        >
          <GridOnIcon fontSize="small" />
        </button>
      </InfoTooltip>
      <NumericStepperInput
        className={styles.toolbarNumericStepperInput}
        value={rendererState.gridHeight.value}
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
