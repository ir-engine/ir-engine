import React from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ColorInput from '../inputs/ColorInput'
import BooleanInput from '../inputs/BooleanInput'
import { useTranslation } from 'react-i18next'
import SquareIcon from '@mui/icons-material/Square'
import { CommandManager } from '../../managers/CommandManager'
import { GroundPlaneComponent } from '@xrengine/engine/src/scene/components/GroundPlaneComponent'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { updateGroundPlane } from '@xrengine/engine/src/scene/functions/loaders/GroundPlaneFunctions'
import { EditorComponentType } from './Util'
import ShadowProperties from './ShadowProperties'

export const GroundPlaneNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  //function handles the changes in color property
  const onChangeColor = (color) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component: GroundPlaneComponent,
      properties: { color }
    })
  }

  const onChangeGenerateNavmesh = (generateNavmesh) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component: GroundPlaneComponent,
      properties: { generateNavmesh }
    })
  }

  const groundPlaneComponent = getComponent(props.node.entity, GroundPlaneComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.groundPlane.name')}
      description={t('editor:properties.groundPlane.description')}
    >
      <InputGroup name="Color" label={t('editor:properties.groundPlane.lbl-color')}>
        <ColorInput value={groundPlaneComponent.color} onChange={onChangeColor} />
      </InputGroup>
      <InputGroup name="Generate Navmesh" label={t('editor:properties.groundPlane.lbl-generateNavmesh')}>
        <BooleanInput value={groundPlaneComponent.generateNavmesh} onChange={onChangeGenerateNavmesh} />
      </InputGroup>
      <ShadowProperties node={props.node} />
    </NodeEditor>
  )
}

GroundPlaneNodeEditor.iconComponent = SquareIcon

export default GroundPlaneNodeEditor
