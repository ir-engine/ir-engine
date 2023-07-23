/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Euler, Vector3 } from 'three'

import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  defineQuery,
  getComponent,
  hasComponent,
  useComponent,
  useOptionalComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { getEntityNodeArrayFromEntities } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { SceneDynamicLoadTagComponent } from '@etherealengine/engine/src/scene/components/SceneDynamicLoadTagComponent'
import { TransformGizmoComponent } from '@etherealengine/engine/src/scene/components/TransformGizmo'
import { TransformSpace } from '@etherealengine/engine/src/scene/constants/transformConstants'
import {
  LocalTransformComponent,
  TransformComponent
} from '@etherealengine/engine/src/transform/components/TransformComponent'
import { dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { EditorHistoryAction } from '../../services/EditorHistory'
import { SelectionState } from '../../services/SelectionServices'
import BooleanInput from '../inputs/BooleanInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import EulerInput from '../inputs/EulerInput'
import InputGroup from '../inputs/InputGroup'
import Vector3Input from '../inputs/Vector3Input'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

/**
 * TransformPropertyGroup component is used to render editor view to customize properties.
 *
 * @type {class component}
 */
export const TransformPropertyGroup: EditorComponentType = (props) => {
  const { t } = useTranslation()

  useOptionalComponent(props.entity, SceneDynamicLoadTagComponent)
  const transformComponent = useComponent(props.entity, TransformComponent)
  const localTransformComponent = useOptionalComponent(props.entity, LocalTransformComponent)

  const onRelease = () => {
    dispatchAction(EditorHistoryAction.createSnapshot({}))
  }

  const onChangeDynamicLoad = (value) => {
    const nodes = getEntityNodeArrayFromEntities(getMutableState(SelectionState).selectedEntities.value).filter(
      (n) => typeof n !== 'string'
    ) as Entity[]
    EditorControlFunctions.addOrRemoveComponent(nodes, SceneDynamicLoadTagComponent, value)
  }

  //function to handle the position properties
  const onChangePosition = (value: Vector3) => {
    const nodes = getEntityNodeArrayFromEntities(getMutableState(SelectionState).selectedEntities.value)
    EditorControlFunctions.positionObject(nodes, [value])

    const gizmoQuery = defineQuery([TransformGizmoComponent])
    for (const entity of gizmoQuery()) {
      const gizmoTransform = getComponent(entity, TransformComponent)
      gizmoTransform.position.set(value.x, value.y, value.z)
    }
  }

  //function to handle changes rotation properties
  const onChangeRotation = (value: Euler) => {
    const nodes = getEntityNodeArrayFromEntities(getMutableState(SelectionState).selectedEntities.value)
    EditorControlFunctions.rotateObject(nodes, [value])

    const gizmoQuery = defineQuery([TransformGizmoComponent])
    for (const entity of gizmoQuery()) {
      const gizmoTransform = getComponent(entity, TransformComponent)
      gizmoTransform.rotation.setFromEuler(value, true)
    }
  }

  //function to handle changes in scale properties
  const onChangeScale = (value) => {
    const nodes = getEntityNodeArrayFromEntities(getMutableState(SelectionState).selectedEntities.value)
    EditorControlFunctions.scaleObject(nodes, [value], TransformSpace.Local, true)
  }

  //rendering editor view for Transform properties
  const transform = localTransformComponent ?? transformComponent!

  return (
    <NodeEditor component={TransformComponent} {...props} name={t('editor:properties.transform.title')}>
      <InputGroup name="Dynamically Load Children" label={t('editor:properties.lbl-dynamicLoad')}>
        <BooleanInput value={hasComponent(props.entity, SceneDynamicLoadTagComponent)} onChange={onChangeDynamicLoad} />
        {hasComponent(props.entity, SceneDynamicLoadTagComponent) && (
          <CompoundNumericInput
            style={{ paddingLeft: `12px`, paddingRight: `3px` }}
            min={1}
            max={100}
            step={1}
            value={getComponent(props.entity, SceneDynamicLoadTagComponent).distance}
            onChange={updateProperty(SceneDynamicLoadTagComponent, 'distance')}
          />
        )}
      </InputGroup>
      <InputGroup name="Position" label={t('editor:properties.transform.lbl-postition')}>
        <Vector3Input
          value={transform.position.value}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={onChangePosition}
          onRelease={onRelease}
        />
      </InputGroup>
      <InputGroup name="Rotation" label={t('editor:properties.transform.lbl-rotation')}>
        <EulerInput quaternion={transform.rotation.value} onChange={onChangeRotation} unit="°" onRelease={onRelease} />
      </InputGroup>
      <InputGroup name="Scale" label={t('editor:properties.transform.lbl-scale')}>
        <Vector3Input
          uniformScaling
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={transform.scale.value}
          onChange={onChangeScale}
          onRelease={onRelease}
        />
      </InputGroup>
    </NodeEditor>
  )
}

export default TransformPropertyGroup
