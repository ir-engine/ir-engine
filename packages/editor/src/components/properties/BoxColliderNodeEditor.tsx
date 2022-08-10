import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { RigidBodyComponent } from '@xrengine/engine/src/physics/components/RigidBodyComponent'
import { updateBoxCollider } from '@xrengine/engine/src/scene/functions/loaders/BoxColliderFunctions'

import PanToolIcon from '@mui/icons-material/PanTool'

import { useSelectionState } from '../../services/SelectionServices'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

export const BoxColliderNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const selectionState = useSelectionState()

  const rigidbodyComponent = getComponent(props.node.entity, RigidBodyComponent).body
  const [isTrigger, setIsTrigger] = useState(rigidbodyComponent.collider(0).isSensor())

  const onUpdateTrigger = (value) => {
    updateBoxCollider(props.node.entity, { isTrigger: value })
    setIsTrigger(value)
  }

  useEffect(() => {
    if (selectionState.propertyName.value === 'scale') {
      updateBoxCollider(props.node.entity)
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
