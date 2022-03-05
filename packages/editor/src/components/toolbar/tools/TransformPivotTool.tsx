import React, { useEffect, useState } from 'react'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformPivot, TransformPivotType } from '@xrengine/engine/src/scene/constants/transformConstants'

import AdjustIcon from '@mui/icons-material/Adjust'

import { EditorControlComponent } from '../../../classes/EditorControlComponent'
import { SceneManager } from '../../../managers/SceneManager'
import { useModeState } from '../../../services/ModeServices'
import { setTransformPivot, toggleTransformPivot } from '../../../systems/EditorControlSystem'
import SelectInput from '../../inputs/SelectInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

/**
 *
 * @author Robert Long
 */
const transformPivotOptions = [
  { label: 'Selection', value: TransformPivot.Selection },
  { label: 'Center', value: TransformPivot.Center },
  { label: 'Bottom', value: TransformPivot.Bottom }
]

const TransformPivotTool = () => {
  const modeState = useModeState()
  const initializeRef = React.useRef<boolean>(false)
  const [transformPivot, changeTransformPivot] = useState<TransformPivotType>(TransformPivot.Selection)

  useEffect(() => {
    if (initializeRef.current) {
      updateTransformPivot()
    } else {
      initializeRef.current = true
    }
  }, [modeState.transformPivotModeChanged.value])

  const updateTransformPivot = () => {
    const editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    changeTransformPivot(editorControlComponent.transformPivot)
  }

  const onChangeTransformPivot = (transformPivot) => {
    setTransformPivot(transformPivot)
  }

  const onToggleTransformPivot = () => {
    toggleTransformPivot()
  }

  return (
    <div className={styles.toolbarInputGroup} id="transform-pivot">
      <InfoTooltip title="[X] Toggle Transform Pivot">
        <button onClick={onToggleTransformPivot} className={styles.toolButton}>
          <AdjustIcon fontSize="small" />
        </button>
      </InfoTooltip>
      <SelectInput
        className={styles.selectInput}
        onChange={onChangeTransformPivot}
        options={transformPivotOptions}
        value={transformPivot}
        creatable={false}
        isSearchable={false}
      />
    </div>
  )
}

export default TransformPivotTool
