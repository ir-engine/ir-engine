import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { isTriggerShape } from '@xrengine/engine/src/physics/classes/Physics'
import { ColliderComponent } from '@xrengine/engine/src/physics/components/ColliderComponent'
import {
  updateBoxCollider,
  updateScaleTransform
} from '@xrengine/engine/src/scene/functions/loaders/BoxColliderFunctions'

import PanToolIcon from '@mui/icons-material/PanTool'

import { useSelectionState } from '../../services/SelectionServices'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

export const BoxColliderNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const selectionState = useSelectionState()

  const colliderComponent = getComponent(props.node.entity, ColliderComponent)
  const world = useWorld()
  const boxShape = world.physics.getRigidbodyShapes(colliderComponent.body)[0]
  const [isTrigger, setIsTrigger] = useState(isTriggerShape(boxShape))

  const onUpdateTrigger = (value) => {
    updateBoxCollider(props.node.entity, { isTrigger: value })
    setIsTrigger(value)
  }

  useEffect(() => {
    if (selectionState.propertyName.value === 'scale') {
      updateScaleTransform(props.node.entity)
    }
  }, [selectionState.objectChangeCounter.value, selectionState.propertyName.value])

  return (
    <NodeEditor {...props} description={t('editor:properties.boxCollider.description')}>
      <InputGroup name="Trigger" label={t('editor:properties.boxCollider.lbl-isTrigger')}>
        <BooleanInput value={isTrigger} onChange={onUpdateTrigger} />
      </InputGroup>
    </NodeEditor>
  )
}

BoxColliderNodeEditor.iconComponent = PanToolIcon

export default BoxColliderNodeEditor
