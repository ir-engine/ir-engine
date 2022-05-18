import React, { useEffect, useState } from 'react'
import { Magnet } from '@styled-icons/fa-solid/Magnet'
import { CommandManager } from '../../../managers/CommandManager'
import EditorEvents from '../../../constants/EditorEvents'
import { InfoTooltip } from '../../layout/Tooltip'
import SelectInput from '../../inputs/SelectInput'
import * as styles from '../styles.module.scss'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { SceneManager } from '../../../managers/SceneManager'
import { EditorControlComponent } from '../../../classes/EditorControlComponent'
import { setSnapMode, toggleSnapMode } from '../../../systems/EditorControlSystem'
import { SnapMode, SnapModeType } from '@xrengine/engine/src/scene/constants/transformConstants'

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
  const [snapSetting, setSnapSetting] = useState(defaultSnapSetting)
  useEffect(() => {
    CommandManager.instance.addListener(EditorEvents.SNAP_SETTINGS_CHANGED.toString(), updateSnapSettings)

    return () => {
      CommandManager.instance.removeListener(EditorEvents.SNAP_SETTINGS_CHANGED.toString(), updateSnapSettings)
    }
  }, [])

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
    CommandManager.instance.emitEvent(EditorEvents.SNAP_SETTINGS_CHANGED)
    setSnapMode(SnapMode.Grid, editorControlComponent)
  }

  const onChangeRotationSnap = (snapValue: number) => {
    const editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    editorControlComponent.rotationSnap = snapValue
    CommandManager.instance.emitEvent(EditorEvents.SNAP_SETTINGS_CHANGED)
    setSnapMode(SnapMode.Grid, editorControlComponent)
  }

  // const onChangeScaleSnap = (snapValue: number) => {
  //   const editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
  //   editorControlComponent.scaleSnap = snapValue
  //   CommandManager.instance.emitEvent(EditorEvents.SNAP_SETTINGS_CHANGED)
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
          <Magnet size={12} />
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
