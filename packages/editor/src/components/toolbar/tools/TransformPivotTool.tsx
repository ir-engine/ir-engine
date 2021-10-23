import React, { useEffect, useState } from 'react'
import { Bullseye } from '@styled-icons/fa-solid/Bullseye'
import { TransformPivot } from '@xrengine/engine/src/scene/constants/transformConstants'
import { ControlManager } from '../../../managers/ControlManager'
import { CommandManager } from '../../../managers/CommandManager'
import EditorEvents from '../../../constants/EditorEvents'
import { InfoTooltip } from '../../layout/Tooltip'
import SelectInput from '../../inputs/SelectInput'
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
  const [transformPivot, setTransformPivot] = useState(TransformPivot.Selection)
  const editorControls = ControlManager.instance.editorControls

  useEffect(() => {
    CommandManager.instance.addListener(EditorEvents.TRANSFORM_PIVOT_CHANGED.toString(), updateTransformPivot)

    return () => {
      CommandManager.instance.removeListener(EditorEvents.TRANSFORM_PIVOT_CHANGED.toString(), updateTransformPivot)
    }
  }, [])

  const updateTransformPivot = () => {
    setTransformPivot(editorControls.transformPivot)
  }

  const onChangeTransformPivot = (transformPivot) => {
    editorControls.setTransformPivot(transformPivot)
  }

  const onToggleTransformPivot = () => {
    editorControls.changeTransformPivot()
  }

  return (
    <div className={styles.toolbarInputGroup} id="transform-pivot">
      <InfoTooltip info="[X] Toggle Transform Pivot">
        <button onClick={onToggleTransformPivot} className={styles.toolButton}>
          <Bullseye size={12} />
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
