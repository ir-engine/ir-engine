import React, { useEffect, useState } from 'react'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { SnapMode, SnapModeType } from '@xrengine/engine/src/scene/constants/transformConstants'

import AttractionsIcon from '@mui/icons-material/Attractions'

import { EditorControlComponent } from '../../../classes/EditorControlComponent'
import { SceneManager } from '../../../managers/SceneManager'
import { ModeAction, useModeState } from '../../../services/ModeServices'
import { setSnapMode, toggleSnapMode } from '../../../systems/EditorControlSystem'
import SelectInput from '../../inputs/SelectInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

/**
 *
 * @author Robert Long
 */
const translationSnapOptions = [
  { label: '0.1m', value: 0.1 },
  { label: '0.125m', value: 0.125 },
  { label: '0.25m', value: 0.25 },
  { label: '0.5m', value: 0.5 },
  { label: '1m', value: 1 },
  { label: '2m', value: 2 },
  { label: '4m', value: 4 }
]

/**
 *
 * @author Robert Long
 */
const rotationSnapOptions = [
  { label: '1°', value: 1 },
  { label: '5°', value: 5 },
  { label: '10°', value: 10 },
  { label: '15°', value: 15 },
  { label: '30°', value: 30 },
  { label: '45°', value: 45 },
  { label: '90°', value: 90 }
]

const defaultSnapSetting = {
  mode: SnapMode.Grid as SnapModeType,
  translationSnap: 0.5,
  rotationSnap: 10
}

const TransformSnapTool = () => {
  const modeState = useModeState()
  const [snapSetting, setSnapSetting] = useState(defaultSnapSetting)

  useEffect(() => {
    updateSnapSettings()
  }, [modeState.snapSettingsChanged])

  const updateSnapSettings = () => {
    const editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)

    setSnapSetting({
      mode: editorControlComponent.snapMode,
      translationSnap: editorControlComponent.translationSnap,
      rotationSnap: editorControlComponent.rotationSnap
    })
  }

  const onChangeTranslationSnap = (snapValue: number) => {
    const editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    editorControlComponent.translationSnap = snapValue
    SceneManager.instance.grid.setSize(snapValue)
    dispatchLocal(ModeAction.changedSnapSettings())
    setSnapMode(SnapMode.Grid, editorControlComponent)
  }

  const onChangeRotationSnap = (snapValue: number) => {
    const editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    editorControlComponent.rotationSnap = snapValue
    dispatchLocal(ModeAction.changedSnapSettings())
    setSnapMode(SnapMode.Grid, editorControlComponent)
  }

  // const onChangeScaleSnap = (snapValue: number) => {
  //   const editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
  //   editorControlComponent.scaleSnap = snapValue
  //   dispatchLocal(ModeAction.changedSnapSettings())
  //   setSnapMode(SnapMode.Grid)
  // }

  const onToggleSnap = () => {
    toggleSnapMode()
  }

  return (
    <div className={styles.toolbarInputGroup} id="transform-snap">
      <InfoTooltip info="[C] Toggle Snap Mode">
        <button
          onClick={onToggleSnap}
          className={styles.toolButton + ' ' + (snapSetting.mode === SnapMode.Grid ? styles.selected : '')}
        >
          <AttractionsIcon fontSize="small" />
        </button>
      </InfoTooltip>
      <SelectInput
        className={styles.selectInput}
        onChange={onChangeTranslationSnap}
        options={translationSnapOptions}
        value={snapSetting.translationSnap}
        creatable={false}
        isSearchable={false}
      />
      <SelectInput
        className={styles.selectInput}
        onChange={onChangeRotationSnap}
        options={rotationSnapOptions}
        value={snapSetting.rotationSnap}
        creatable={false}
        isSearchable={false}
      />
    </div>
  )
}

export default TransformSnapTool
