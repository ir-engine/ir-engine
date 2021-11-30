import React, { useCallback, useEffect, useState } from 'react'
import { Sun } from '@styled-icons/boxicons-regular/Sun'
import { CommandManager } from '../../../managers/CommandManager'
import EditorEvents from '../../../constants/EditorEvents'
import SelectInput from '../../inputs/SelectInput'
import * as styles from '../styles.module.scss'
import { RenderModes, RenderModesType } from '../../../constants/RenderModes'
import { SceneManager } from '../../../managers/SceneManager'
import { InfoTooltip } from '../../layout/Tooltip'

const RenderModeTool = () => {
  const [renderMode, setRenderMode] = useState<RenderModesType>(RenderModes.UNLIT)

  const options = []

  for (let key of Object.keys(RenderModes)) {
    options.push({
      label: RenderModes[key],
      value: RenderModes[key]
    })
  }

  const onChangeRenderMode = useCallback((mode) => {
    SceneManager.instance.changeRenderMode(mode)
    setRenderMode(SceneManager.instance.renderMode)
  }, [])

  return (
    <div className={styles.toolbarInputGroup} id="transform-pivot">
      <InfoTooltip info="Render Mode">
        <div className={styles.toolIcon}>
          <Sun size={16} />
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
