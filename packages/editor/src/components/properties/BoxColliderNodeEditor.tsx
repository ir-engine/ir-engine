import React from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import BooleanInput from '../inputs/BooleanInput'
import { useTranslation } from 'react-i18next'
import PanToolIcon from '@mui/icons-material/PanTool'
import { EditorComponentType, updateProperty } from './Util'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ColliderComponent } from '@xrengine/engine/src/physics/components/ColliderComponent'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { isTriggerShape } from '@xrengine/engine/src/physics/classes/Physics'

export const BoxColliderNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const colliderComponent = getComponent(props.node.entity, ColliderComponent)
  const world = useWorld()
  const boxShape = world.physics.getRigidbodyShapes(colliderComponent.body)[0]
  const isTrigger = isTriggerShape(boxShape)

  return (
    <NodeEditor {...props} description={t('editor:properties.boxCollider.description')}>
      <InputGroup name="Trigger" label={t('editor:properties.boxCollider.lbl-isTrigger')}>
        <BooleanInput value={isTrigger} onChange={updateProperty(null!, 'isTrigger')} />
      </InputGroup>
    </NodeEditor>
  )
}

BoxColliderNodeEditor.iconComponent = PanToolIcon

export default BoxColliderNodeEditor
