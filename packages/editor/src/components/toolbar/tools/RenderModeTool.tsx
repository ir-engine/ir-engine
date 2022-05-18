import React from 'react'

import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'

import { RenderModes } from '../../../constants/RenderModes'
import { changeRenderMode } from '../../../functions/changeRenderMode'
import { useModeState } from '../../../services/ModeServices'
import SelectInput from '../../inputs/SelectInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const RenderModeTool = () => {
  const modeState = useModeState()
  const options = [] as { label: string; value: string }[]

  for (let key of Object.keys(RenderModes)) {
    options.push({
      label: RenderModes[key],
      value: RenderModes[key]
    })
  }

  return (
    <div className={styles.toolbarInputGroup} id="transform-pivot">
      <InfoTooltip title="Render Mode">
        <div className={styles.toolIcon}>
          <WbSunnyOutlinedIcon fontSize="small" />
        </div>
      </InfoTooltip>
      <SelectInput
        className={styles.selectInput}
        onChange={changeRenderMode}
        options={options}
        value={modeState.renderMode.value}
        creatable={false}
        isSearchable={false}
      />
    </div>
  )
}

export default RenderModeTool
