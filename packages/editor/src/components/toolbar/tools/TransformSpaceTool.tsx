import React, { useEffect, useState } from 'react'
import { Globe } from '@styled-icons/fa-solid/Globe'
import { CommandManager } from '../../../managers/CommandManager'
import EditorEvents from '../../../constants/EditorEvents'
import { InfoTooltip } from '../../layout/Tooltip'
import SelectInput from '../../inputs/SelectInput'
import * as styles from '../styles.module.scss'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EditorControlComponent } from '../../../classes/EditorControlComponent'
import { SceneManager } from '../../../managers/SceneManager'
import { setTransformSpace } from '../../../systems/EditorControlSystem'

/**
 *
 * @author Robert Long
 */
const transformSpaceOptions = [
  { label: 'Selection', value: TransformSpace.LocalSelection },
  { label: 'World', value: TransformSpace.World }
]

const TransformSpaceTool = () => {
  const [transformSpace, changeTransformSpace] = useState(TransformSpace.World)

  const onChangeTransformSpace = (transformSpace) => {
    console.log('The Transform Space is:' + transformSpace)
    setTransformSpace(transformSpace)
    const editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    changeTransformSpace(editorControlComponent.transformSpace)
  }

  const onToggleTransformSpace = () => {
    onChangeTransformSpace(
      transformSpace === TransformSpace.World ? TransformSpace.LocalSelection : TransformSpace.World
    )
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
