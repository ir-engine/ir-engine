import React from 'react'

import { RenderModesType } from '@xrengine/engine/src/renderer/constants/RenderModes'
import { RenderModes } from '@xrengine/engine/src/renderer/constants/RenderModes'
import { EngineRendererState } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import { getState, useHookstate } from '@xrengine/hyperflux'

import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'

import SelectInput from '../../inputs/SelectInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const RenderModeTool = () => {
  const engineRendererState = useHookstate(getState(EngineRendererState))
  const options = [] as { label: string; value: string }[]

  for (let key of Object.keys(RenderModes)) {
    options.push({
      label: RenderModes[key],
      value: RenderModes[key]
    })
  }

  const onChangeRenderMode = (mode: RenderModesType) => {
    engineRendererState.renderMode.set(mode)
  }

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
