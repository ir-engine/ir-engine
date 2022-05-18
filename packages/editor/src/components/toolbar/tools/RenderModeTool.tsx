import React, { useCallback, useEffect, useState } from 'react'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'
import { CommandManager } from '../../../managers/CommandManager'
import EditorEvents from '../../../constants/EditorEvents'
import SelectInput from '../../inputs/SelectInput'
import * as styles from '../styles.module.scss'
import { RenderModes, RenderModesType } from '../../../constants/RenderModes'
import { SceneManager } from '../../../managers/SceneManager'
import { InfoTooltip } from '../../layout/Tooltip'

const RenderModeTool = () => {
  const [renderMode, setRenderMode] = useState<RenderModesType>(RenderModes.SHADOW)

  const options = [] as { label: string; value: string }[]

  for (let key of Object.keys(RenderModes)) {
    options.push({
      label: RenderModes[key],
      value: RenderModes[key]
    })
  }

  useEffect(() => {
    CommandManager.instance.addListener(EditorEvents.RENDER_MODE_CHANGED.toString(), changeRenderMode)

    return () => {
      CommandManager.instance.removeListener(EditorEvents.RENDER_MODE_CHANGED.toString(), changeRenderMode)
    }
  }, [])

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
