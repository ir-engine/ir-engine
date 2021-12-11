import React from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ColorInput from '../inputs/ColorInput'
import BooleanInput from '../inputs/BooleanInput'
import { useTranslation } from 'react-i18next'
import SquareIcon from '@mui/icons-material/Square'
import { CommandManager } from '../../managers/CommandManager'
import { GroundPlaneComponent } from '@xrengine/engine/src/scene/components/GroundPlaneComponent'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ShadowComponent } from '@xrengine/engine/src/scene/components/ShadowComponent'
import { updateGroundPlane } from '@xrengine/engine/src/scene/functions/GroundPlaneFunctions'
import EditorCommands from '../../constants/EditorCommands'
import { TagComponentOperation } from '../../commands/TagComponentCommand'

/**
 * Declaring GroundPlaneNodeEditor properties.
 *
 * @author Robert Long
 * @type {Object}
 */

type GroundPlaneNodeEditorProps = {
  node: EntityTreeNode
  t: Function
}

/**
 * IconComponent is used to render GroundPlaneNode
 *
 * @author Robert Long
 * @type {class component}
 */
export const GroundPlaneNodeEditor = (props: GroundPlaneNodeEditorProps) => {
  const { t } = useTranslation()

  //function handles the changes in color property
  const onChangeColor = (color) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      updateFunction: updateGroundPlane,
      component: GroundPlaneComponent,
      properties: { color }
    })
  }

  const onChangeGenerateNavmesh = (generateNavmesh) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      updateFunction: updateGroundPlane,
      component: GroundPlaneComponent,
      properties: { generateNavmesh }
    })
  }

  //function handles the changes for receiveShadow property
  const onChangeReceiveShadow = (receiveShadow) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      updateFunction: updateGroundPlane,
      component: ShadowComponent,
      properties: { receiveShadow }
    })
  }

  const groundPlaneComponent = getComponent(props.node.entity, GroundPlaneComponent)
  const shadowComponent = getComponent(props.node.entity, ShadowComponent)

  return (
    <NodeEditor {...props} description={t('editor:properties.groundPlane.description')}>
      <InputGroup name="Color" label={t('editor:properties.groundPlane.lbl-color')}>
        <ColorInput value={groundPlaneComponent.color} onChange={onChangeColor} />
      </InputGroup>
      <InputGroup name="Receive Shadow" label={t('editor:properties.groundPlane.lbl-receiveShadow')}>
        <BooleanInput value={shadowComponent.receiveShadow} onChange={onChangeReceiveShadow} />
      </InputGroup>
      <InputGroup name="Generate Navmesh" label={t('editor:properties.groundPlane.lbl-generateNavmesh')}>
        <BooleanInput value={groundPlaneComponent.generateNavmesh} onChange={onChangeGenerateNavmesh} />
      </InputGroup>
    </NodeEditor>
  )
}

GroundPlaneNodeEditor.iconComponent = SquareIcon

export default GroundPlaneNodeEditor
