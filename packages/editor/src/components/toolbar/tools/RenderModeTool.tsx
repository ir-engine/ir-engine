import React from 'react'

import { RenderModesType } from '@etherealengine/engine/src/renderer/constants/RenderModes'
import { RenderModes } from '@etherealengine/engine/src/renderer/constants/RenderModes'
import { RendererState } from '@etherealengine/engine/src/renderer/RendererState'
import { getState, useHookstate } from '@etherealengine/hyperflux'

import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'

import SelectInput from '../../inputs/SelectInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const RenderModeTool = () => {
  const rendererState = useHookstate(getState(RendererState))
  const options = [] as { label: string; value: string }[]

  for (let key of Object.keys(RenderModes)) {
    options.push({
      label: RenderModes[key],
      value: RenderModes[key]
    })
  }

  const onChangeRenderMode = (mode: RenderModesType) => {
    rendererState.renderMode.set(mode)
  }

  return (
    <div className={styles.toolbarInputGroup} id="transform-pivot">
      <InfoTooltip title="Render Mode">
        <div className={styles.toolIcon}>
          <WbSunnyOutlinedIcon fontSize="small" />
        </div>
      </InfoTooltip>
      <SelectInput
        key={rendererState.renderMode.value}
        className={styles.selectInput}
        onChange={onChangeRenderMode}
        options={options}
        value={rendererState.renderMode.value}
        creatable={false}
        isSearchable={false}
      />
    </div>
  )
}

export default RenderModeTool
