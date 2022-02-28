import React, { useCallback, useEffect, useState } from 'react'

import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'

import { RenderModes, RenderModesType } from '../../../constants/RenderModes'
import { SceneManager } from '../../../managers/SceneManager'
import { useModeState } from '../../../services/ModeServices'
import SelectInput from '../../inputs/SelectInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const RenderModeTool = () => {
  const modeState = useModeState()
  const initializeRef = React.useRef<boolean>(false)
  const [renderMode, setRenderMode] = useState<RenderModesType>(SceneManager.instance.renderMode)

  const options = [] as { label: string; value: string }[]

  for (let key of Object.keys(RenderModes)) {
    options.push({
      label: RenderModes[key],
      value: RenderModes[key]
    })
  }

  useEffect(() => {
    if (initializeRef.current) {
      changeRenderMode()
    } else {
      initializeRef.current = true
    }
  }, [modeState.renderModeChanged])

  const onChangeRenderMode = useCallback((mode) => SceneManager.instance.changeRenderMode(mode), [])
  const changeRenderMode = useCallback(() => setRenderMode(SceneManager.instance.renderMode), [])

  return (
    <div className={styles.toolbarInputGroup} id="transform-pivot">
      <InfoTooltip info="Render Mode">
        <div className={styles.toolIcon}>
          <WbSunnyOutlinedIcon fontSize="small" />
        </div>
      </InfoTooltip>
      <SelectInput
        className={styles.selectInput}
        onChange={onChangeRenderMode}
        options={options}
        value={renderMode}
        creatable={false}
        isSearchable={false}
      />
    </div>
  )
}

export default RenderModeTool
