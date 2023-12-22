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
import { Euler, Quaternion, Vector3 } from 'three'

import {
  getComponent,
  hasComponent,
  useComponent,
  useOptionalComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { SceneDynamicLoadTagComponent } from '@etherealengine/engine/src/scene/components/SceneDynamicLoadTagComponent'
import { TransformSpace } from '@etherealengine/engine/src/scene/constants/transformConstants'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { SelectionState } from '../../services/SelectionServices'
import BooleanInput from '../inputs/BooleanInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import EulerInput from '../inputs/EulerInput'
import InputGroup from '../inputs/InputGroup'
import Vector3Input from '../inputs/Vector3Input'
import PropertyGroup from './PropertyGroup'
import { EditorComponentType, commitProperty, updateProperty } from './Util'

const position = new Vector3()
const rotation = new Quaternion()
const scale = new Vector3()

/**
 * TransformPropertyGroup component is used to render editor view to customize properties.
 */
export const TransformPropertyGroup: EditorComponentType = (props) => {
  const { t } = useTranslation()

  useOptionalComponent(props.entity, SceneDynamicLoadTagComponent)
  const hasParentTransform = useOptionalComponent(props.entity, EntityTreeComponent)?.parentEntity?.value
  const transformComponent = useComponent(props.entity, TransformComponent)
  const useGlobalTransformComponent = useHookstate(false)

  useGlobalTransformComponent.value
    ? transformComponent.matrixWorld.value.decompose(position, rotation, scale)
    : transformComponent.matrix.value.decompose(position, rotation, scale)

  const onRelease = () => {
    EditorControlFunctions.commitTransformSave([props.entity])
  }

  const onChangeDynamicLoad = (value) => {
    const nodes = getMutableState(SelectionState).selectedEntities.value
    EditorControlFunctions.addOrRemoveComponent(nodes, SceneDynamicLoadTagComponent, value)
  }

  const onChangePosition = (value: Vector3) => {
    const nodes = getMutableState(SelectionState).selectedEntities.value
    EditorControlFunctions.positionObject(
      nodes,
      [value],
      useGlobalTransformComponent.value ? TransformSpace.world : TransformSpace.local
    )
    TransformComponent.stateMap[props.entity]!.set(TransformComponent.valueMap[props.entity])
  }

  const onChangeRotation = (value: Euler) => {
    const nodes = getMutableState(SelectionState).selectedEntities.value
    EditorControlFunctions.rotateObject(
      nodes,
      [value],
      useGlobalTransformComponent.value ? TransformSpace.world : TransformSpace.local
    )
    TransformComponent.stateMap[props.entity]!.set(TransformComponent.valueMap[props.entity])
  }

  const onChangeScale = (value: Vector3) => {
    if (useGlobalTransformComponent.value) {
      transformComponent.scale.set(transformComponent.value.scale.copy(value))
    }
    const nodes = getMutableState(SelectionState).selectedEntities.value
    EditorControlFunctions.scaleObject(
      nodes,
      [value],
      useGlobalTransformComponent.value ? TransformSpace.world : TransformSpace.local,
      true
    )
    TransformComponent.stateMap[props.entity]!.set(TransformComponent.valueMap[props.entity])
  }

  return (
    <PropertyGroup name={t('editor:properties.transform.title')}>
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
            onRelease={commitProperty(SceneDynamicLoadTagComponent, 'distance')}
          />
        )}
      </InputGroup>
      {hasParentTransform && (
        <InputGroup name="Use Global Transform" label={t('editor:properties.transform.lbl-useGlobalTransform')}>
          <BooleanInput
            value={useGlobalTransformComponent.value}
            onChange={() => useGlobalTransformComponent.set((prev) => !prev)}
          />
        </InputGroup>
      )}
      <InputGroup name="Position" label={t('editor:properties.transform.lbl-position')}>
        <Vector3Input
          value={position}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={onChangePosition}
          onRelease={onRelease}
        />
      </InputGroup>
      <InputGroup name="Rotation" label={t('editor:properties.transform.lbl-rotation')}>
        <EulerInput quaternion={rotation} onChange={onChangeRotation} unit="°" onRelease={onRelease} />
      </InputGroup>
      <InputGroup name="Scale" label={t('editor:properties.transform.lbl-scale')}>
        <Vector3Input
          uniformScaling
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={scale}
          onChange={onChangeScale}
          onRelease={onRelease}
        />
      </InputGroup>
    </PropertyGroup>
  )
}

export default TransformPropertyGroup
