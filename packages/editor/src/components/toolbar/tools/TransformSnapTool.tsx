import React from 'react'

import { useDispatch } from '@xrengine/client-core/src/store'
import { SnapMode } from '@xrengine/engine/src/scene/constants/transformConstants'

import AttractionsIcon from '@mui/icons-material/Attractions'

import { SceneState } from '../../../functions/sceneRenderFunctions'
import { toggleSnapMode } from '../../../functions/transformFunctions'
import { ModeAction, useModeState } from '../../../services/ModeServices'
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

const TransformSnapTool = () => {
  const modeState = useModeState()
  const dispatch = useDispatch()

  const onChangeTranslationSnap = (snapValue: number) => {
    SceneState.grid.setSize(snapValue)
    dispatch(ModeAction.changeTranslationSnap(snapValue))

    if (modeState.snapMode.value !== SnapMode.Grid) {
      dispatch(ModeAction.changedSnapMode(SnapMode.Grid))
    }
  }

  const onChangeRotationSnap = (snapValue: number) => {
    dispatch(ModeAction.changeRotationSnap(snapValue))
    if (modeState.snapMode.value !== SnapMode.Grid) {
      dispatch(ModeAction.changedSnapMode(SnapMode.Grid))
    }
  }

  // const onChangeScaleSnap = (snapValue: number) => {
  //   dispatch(ModeAction.changeScaleSnap(snapValue))
  //   if (modeState.snapMode.value !== SnapMode.Grid) {
  //     dispatch(ModeAction.changedSnapMode(SnapMode.Grid))
  //   }
  // }

  return (
    <div className={styles.toolbarInputGroup} id="transform-snap">
      <InfoTooltip title="[C] Toggle Snap Mode">
        <button
          onClick={toggleSnapMode}
          className={styles.toolButton + ' ' + (modeState.snapMode.value === SnapMode.Grid ? styles.selected : '')}
        >
          <AttractionsIcon fontSize="small" />
        </button>
      </InfoTooltip>
      <SelectInput
        className={styles.selectInput}
        onChange={onChangeTranslationSnap}
        options={translationSnapOptions}
        value={modeState.translationSnap.value}
        creatable={false}
        isSearchable={false}
      />
      <SelectInput
        className={styles.selectInput}
        onChange={onChangeRotationSnap}
        options={rotationSnapOptions}
        value={modeState.rotationSnap.value}
        creatable={false}
        isSearchable={false}
      />
    </div>
  )
}

export default TransformSnapTool
