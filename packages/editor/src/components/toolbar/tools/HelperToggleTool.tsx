import React from 'react'

import { EngineRendererState } from '@xrengine/engine/src/renderer/EngineRendererState'
import { getState, useHookstate } from '@xrengine/hyperflux'

import SelectAllIcon from '@mui/icons-material/SelectAll'
import SquareFootIcon from '@mui/icons-material/SquareFoot'

import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

export const HelperToggleTool = () => {
  const engineRendererState = useHookstate(getState(EngineRendererState))

  const toggleDebug = () => {
    engineRendererState.debugEnable.set(!engineRendererState.debugEnable.value)
  }

  const toggleNodeHelpers = () => {
    engineRendererState.nodeHelperVisibility.set(!engineRendererState.nodeHelperVisibility.value)
  }

  return (
    <>
      <div id="transform-grid" className={styles.toolbarInputGroup + ' ' + styles.playButtonContainer}>
        <InfoTooltip title="Toggle Helpers">
          <button
            onClick={toggleDebug}
            className={styles.toolButton + ' ' + (engineRendererState.debugEnable.value ? styles.selected : '')}
          >
            <SquareFootIcon fontSize="small" />
          </button>
        </InfoTooltip>
      </div>
      <div id="transform-grid" className={styles.toolbarInputGroup + ' ' + styles.playButtonContainer}>
        <InfoTooltip title="Toggle Node Helpers">
          <button
            onClick={toggleNodeHelpers}
            className={
              styles.toolButton + ' ' + (engineRendererState.nodeHelperVisibility.value ? styles.selected : '')
            }
          >
            <SelectAllIcon fontSize="small" />
          </button>
        </InfoTooltip>
      </div>
    </>
  )
}

export default HelperToggleTool
