import React from 'react'

import { RendererState } from '@etherealengine/engine/src/renderer/RendererState'
import { getState, useHookstate } from '@etherealengine/hyperflux'

import SelectAllIcon from '@mui/icons-material/SelectAll'
import SquareFootIcon from '@mui/icons-material/SquareFoot'

import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

export const HelperToggleTool = () => {
  const rendererState = useHookstate(getState(RendererState))

  const toggleDebug = () => {
    rendererState.debugEnable.set(!rendererState.debugEnable.value)
  }

  const toggleNodeHelpers = () => {
    rendererState.nodeHelperVisibility.set(!rendererState.nodeHelperVisibility.value)
  }

  return (
    <>
      <div id="transform-grid" className={styles.toolbarInputGroup + ' ' + styles.playButtonContainer}>
        <InfoTooltip title="Toggle Helpers">
          <button
            onClick={toggleDebug}
            className={styles.toolButton + ' ' + (rendererState.debugEnable.value ? styles.selected : '')}
          >
            <SquareFootIcon fontSize="small" />
          </button>
        </InfoTooltip>
      </div>
      <div id="transform-grid" className={styles.toolbarInputGroup + ' ' + styles.playButtonContainer}>
        <InfoTooltip title="Toggle Node Helpers">
          <button
            onClick={toggleNodeHelpers}
            className={styles.toolButton + ' ' + (rendererState.nodeHelperVisibility.value ? styles.selected : '')}
          >
            <SelectAllIcon fontSize="small" />
          </button>
        </InfoTooltip>
      </div>
    </>
  )
}

export default HelperToggleTool
