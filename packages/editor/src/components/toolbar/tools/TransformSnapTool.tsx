import React from 'react'

import InfiniteGridHelper from '@xrengine/engine/src/scene/classes/InfiniteGridHelper'
import { SnapMode } from '@xrengine/engine/src/scene/constants/transformConstants'
import { dispatchAction } from '@xrengine/hyperflux'

import AttractionsIcon from '@mui/icons-material/Attractions'

import { toggleSnapMode } from '../../../functions/transformFunctions'
import { EditorHelperAction, useEditorHelperState } from '../../../services/EditorHelperState'
import SelectInput from '../../inputs/SelectInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const translationSnapOptions = [
  { label: '0.1m', value: 0.1 },
  { label: '0.125m', value: 0.125 },
  { label: '0.25m', value: 0.25 },
  { label: '0.5m', value: 0.5 },
  { label: '1m', value: 1 },
  { label: '2m', value: 2 },
  { label: '4m', value: 4 }
]

const rotationSnapOptions = [
  { label: '1°', value: 1 },
  { label: '5°', value: 5 },
  { label: '10°', value: 10 },
  { label: '15°', value: 15 },
  { label: '30°', value: 30 },
  { label: '45°', value: 45 },
  { label: '90°', value: 90 }
]

const TransformSnapTool = () => {
  const editorHelperState = useEditorHelperState()

  const onChangeTranslationSnap = (snapValue: number) => {
    InfiniteGridHelper.instance.setSize(snapValue)
    dispatchAction(EditorHelperAction.changeTranslationSnap({ translationSnap: snapValue }))

    if (editorHelperState.snapMode.value !== SnapMode.Grid) {
      dispatchAction(EditorHelperAction.changedSnapMode({ snapMode: SnapMode.Grid }))
    }
  }

  const onChangeRotationSnap = (snapValue: number) => {
    dispatchAction(EditorHelperAction.changeRotationSnap({ rotationSnap: snapValue }))
    if (editorHelperState.snapMode.value !== SnapMode.Grid) {
      dispatchAction(EditorHelperAction.changedSnapMode({ snapMode: SnapMode.Grid }))
    }
  }

  // const onChangeScaleSnap = (snapValue: number) => {
  //   dispatchAction(EditorHelperAction.changeScaleSnap({ scaleSnap: snapValue }))
  //   if (editorHelperState.snapMode.value !== SnapMode.Grid) {
  //     dispatchAction(EditorHelperAction.changedSnapMode({ snapMode: SnapMode.Grid }))
  //   }
  // }

  return (
    <div className={styles.toolbarInputGroup} id="transform-snap">
      <InfoTooltip title="[C] Toggle Snap Mode">
        <button
          onClick={toggleSnapMode}
          className={
            styles.toolButton + ' ' + (editorHelperState.snapMode.value === SnapMode.Grid ? styles.selected : '')
          }
        >
          <AttractionsIcon fontSize="small" />
        </button>
      </InfoTooltip>
      <SelectInput
        key={editorHelperState.translationSnap.value}
        className={styles.selectInput}
        onChange={onChangeTranslationSnap}
        options={translationSnapOptions}
        value={editorHelperState.translationSnap.value}
        creatable={false}
        isSearchable={false}
      />
      <SelectInput
        key={editorHelperState.rotationSnap.value}
        className={styles.selectInput}
        onChange={onChangeRotationSnap}
        options={rotationSnapOptions}
        value={editorHelperState.rotationSnap.value}
        creatable={false}
        isSearchable={false}
      />
    </div>
  )
}

export default TransformSnapTool
