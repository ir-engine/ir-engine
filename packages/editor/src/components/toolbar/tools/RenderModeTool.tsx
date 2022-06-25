import React, { useCallback } from 'react'

import { RenderModesType } from '@xrengine/engine/src/renderer/constants/RenderModes'
import { RenderModes } from '@xrengine/engine/src/renderer/constants/RenderModes'
import { EngineRendererAction, useEngineRendererState } from '@xrengine/engine/src/renderer/EngineRendererState'
import { dispatchAction } from '@xrengine/hyperflux'

import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'

import SelectInput from '../../inputs/SelectInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const RenderModeTool = () => {
  const engineRendererState = useEngineRendererState()
  const options = [] as { label: string; value: string }[]

  for (let key of Object.keys(RenderModes)) {
    options.push({
      label: RenderModes[key],
      value: RenderModes[key]
    })
  }

  const onChangeRenderMode = useCallback((mode: RenderModesType) => {
    dispatchAction(EngineRendererAction.changedRenderMode({ renderMode: mode }))
  }, [])

  return (
    <div className={styles.toolbarInputGroup} id="transform-pivot">
      <InfoTooltip title="Render Mode">
        <div className={styles.toolIcon}>
          <WbSunnyOutlinedIcon fontSize="small" />
        </div>
      </InfoTooltip>
      <SelectInput
        key={engineRendererState.renderMode.value}
        className={styles.selectInput}
        onChange={onChangeRenderMode}
        options={options}
        value={engineRendererState.renderMode.value}
        creatable={false}
        isSearchable={false}
      />
    </div>
  )
}

export default RenderModeTool
