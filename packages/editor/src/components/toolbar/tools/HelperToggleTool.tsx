import React, { useCallback, useState } from 'react'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import {
  accessEngineRendererState,
  EngineRendererAction,
  useEngineRendererState
} from '@xrengine/engine/src/renderer/EngineRendererState'
import { ObjectLayers } from '@xrengine/engine/src/scene/constants/ObjectLayers'
import { dispatchAction } from '@xrengine/hyperflux'

import SelectAllIcon from '@mui/icons-material/SelectAll'
import SquareFootIcon from '@mui/icons-material/SquareFoot'

import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

export const HelperToggleTool = () => {
  const engineRenderState = useEngineRendererState()
  const [, updateState] = useState<any>()
  const forceUpdate = useCallback(() => updateState({}), [])
  const engineRendererState = useEngineRendererState()

  const toggleDebug = () => {
    forceUpdate()
    dispatchAction(EngineRendererAction.setDebug({ debugEnable: !engineRenderState.debugEnable.value }))
  }

  const toggleNodeHelpers = () => {
    Engine.instance.currentWorld.camera.layers.toggle(ObjectLayers.NodeHelper)
    dispatchAction(
      EngineRendererAction.changeNodeHelperVisibility({ visibility: !engineRenderState.nodeHelperVisibility.value })
    )
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
            className={styles.toolButton + ' ' + (engineRenderState.nodeHelperVisibility.value ? styles.selected : '')}
          >
            <SelectAllIcon fontSize="small" />
          </button>
        </InfoTooltip>
      </div>
    </>
  )
}

export default HelperToggleTool
