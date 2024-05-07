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
} from '@etherealengine/ecs/src/ComponentFunctions'
import { SceneDynamicLoadTagComponent } from '@etherealengine/engine/src/scene/components/SceneDynamicLoadTagComponent'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { BooleanInput } from '@etherealengine/ui/src/components/editor/input/Boolean'
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation'

import {
  EditorComponentType,
  commitProperty,
  updateProperty
} from '@etherealengine/editor/src/components/properties/Util'
import { ObjectGridSnapState } from '@etherealengine/editor/src/systems/ObjectGridSnapSystem'

import { EditorControlFunctions } from '@etherealengine/editor/src/functions/EditorControlFunctions'
import { EditorHelperState } from '@etherealengine/editor/src/services/EditorHelperState'
import { SelectionState } from '@etherealengine/editor/src/services/SelectionServices'
import { TransformSpace } from '@etherealengine/engine/src/scene/constants/transformConstants'
import { TransformComponent } from '@etherealengine/spatial'
import EulerInput from '../../input/Euler'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import Vector3Input from '../../input/Vector3'
import PropertyGroup from '../group'

const position = new Vector3()
const rotation = new Quaternion()
const scale = new Vector3()

/**
 * TransformPropertyGroup component is used to render editor view to customize properties.
 */
export const TransformPropertyGroup: EditorComponentType = (props) => {
  const { t } = useTranslation()

  useOptionalComponent(props.entity, SceneDynamicLoadTagComponent)
  const transformComponent = useComponent(props.entity, TransformComponent)
  const transformSpace = useHookstate(getMutableState(EditorHelperState).transformSpace)

  transformSpace.value === TransformSpace.world
    ? transformComponent.matrixWorld.value.decompose(position, rotation, scale)
    : transformComponent.matrix.value.decompose(position, rotation, scale)

  scale.copy(transformComponent.scale.value)

  const onRelease = () => {
    const bboxSnapState = getMutableState(ObjectGridSnapState)
    if (bboxSnapState.enabled.value) {
      bboxSnapState.apply.set(true)
    } else {
      EditorControlFunctions.commitTransformSave([props.entity])
    }
  }

  const onChangeDynamicLoad = (value) => {
    const selectedEntities = SelectionState.getSelectedEntities()
    EditorControlFunctions.addOrRemoveComponent(selectedEntities, SceneDynamicLoadTagComponent, value)
  }

  const onChangePosition = (value: Vector3) => {
    const selectedEntities = SelectionState.getSelectedEntities()
    EditorControlFunctions.positionObject(selectedEntities, [value])
  }

  const onChangeRotation = (value: Euler) => {
    const selectedEntities = SelectionState.getSelectedEntities()
    EditorControlFunctions.rotateObject(selectedEntities, [value])
  }

  const onChangeScale = (value: Vector3) => {
    const selectedEntities = SelectionState.getSelectedEntities()
    EditorControlFunctions.scaleObject(selectedEntities, [value], true)
  }

  return (
    <PropertyGroup name={t('editor:properties.transform.title')} description="change transform of an entity">
      <InputGroup name="Dynamically Load Children" label={t('editor:properties.lbl-dynamicLoad')}>
        <BooleanInput value={hasComponent(props.entity, SceneDynamicLoadTagComponent)} onChange={onChangeDynamicLoad} />
        {hasComponent(props.entity, SceneDynamicLoadTagComponent) && (
          <NumericInput
            //style={{ paddingLeft: `12px`, paddingRight: `3px` }}
            min={1}
            max={100}
            //step={1}
            value={getComponent(props.entity, SceneDynamicLoadTagComponent).distance}
            onChange={updateProperty(SceneDynamicLoadTagComponent, 'distance')}
            onRelease={commitProperty(SceneDynamicLoadTagComponent, 'distance')}
          />
        )}
      </InputGroup>
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

TransformPropertyGroup.iconComponent = ThreeDRotationIcon

export default TransformPropertyGroup
