import React, { useEffect, useState } from 'react'
import { Globe } from '@styled-icons/fa-solid/Globe'
import { ControlManager } from '../../../managers/ControlManager'
import { CommandManager } from '../../../managers/CommandManager'
import EditorEvents from '../../../constants/EditorEvents'
import { InfoTooltip } from '../../layout/Tooltip'
import SelectInput from '../../inputs/SelectInput'
import * as styles from '../styles.module.scss'
import { TransformSpace } from '../../../constants/TransformSpace'

/**
 *
 * @author Robert Long
 */
const transformSpaceOptions = [
  { label: 'Selection', value: TransformSpace.LocalSelection },
  { label: 'World', value: TransformSpace.World }
]

const TransformSpaceTool = () => {
  const [transformSpace, setTransformSpace] = useState(TransformSpace.World)

  useEffect(() => {
    CommandManager.instance.addListener(EditorEvents.TRANSFORM_SPACE_CHANGED.toString(), updateTransformSpace)

    return () => {
      CommandManager.instance.removeListener(EditorEvents.TRANSFORM_SPACE_CHANGED.toString(), updateTransformSpace)
    }
  }, [])

  const updateTransformSpace = () => {
    setTransformSpace(ControlManager.instance.editorControls.transformSpace)
  }

  const onChangeTransformSpace = (transformSpace) => {
    ControlManager.instance.editorControls.setTransformSpace(transformSpace)
  }

  const onToggleTransformSpace = () => {
    ControlManager.instance.editorControls.toggleTransformSpace()
  }

  return (
    <div className={styles.toolbarInputGroup} id="transform-space">
      <InfoTooltip info="[Z] Toggle Transform Space">
        <button onClick={onToggleTransformSpace} className={styles.toolButton}>
          <Globe size={12} />
        </button>
      </InfoTooltip>
      <SelectInput
        className={styles.selectInput}
        onChange={onChangeTransformSpace}
        options={transformSpaceOptions}
        value={transformSpace}
        creatable={false}
        isSearchable={false}
      />
    </div>
  )
}

export default TransformSpaceTool
