/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Quaternion, Vector3 } from 'three'

import { getComponent, useComponent, useOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { SceneDynamicLoadTagComponent } from '@ir-engine/engine/src/scene/components/SceneDynamicLoadTagComponent'
import { getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'

import { LuMove3D } from 'react-icons/lu'

import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { ObjectGridSnapState } from '@ir-engine/editor/src/systems/ObjectGridSnapSystem'

import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import { EditorHelperState } from '@ir-engine/editor/src/services/EditorHelperState'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { TransformSpace } from '@ir-engine/engine/src/scene/constants/transformConstants'
import { TransformComponent } from '@ir-engine/spatial'

import { Checkbox } from '@ir-engine/ui'
import ComponentDropdown from '../../ComponentDropdown'
import EulerInput from '../../input/Euler'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import Vector3Input from '../../input/Vector3'

const position = new Vector3()
const rotation = new Quaternion()
const scale = new Vector3()

/**
 * TransformPropertyGroup component is used to render editor view to customize properties.
 */
export const TransformPropertyGroup: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const hasDynamicLoad = !!useOptionalComponent(props.entity, SceneDynamicLoadTagComponent)
  const transformComponent = useComponent(props.entity, TransformComponent)
  const transformSpace = useHookstate(getMutableState(EditorHelperState).transformSpace)

  position.copy(transformComponent.position.value)
  rotation.copy(transformComponent.rotation.value)
  scale.copy(transformComponent.scale.value)

  if (transformSpace.value === TransformSpace.world)
    transformComponent.matrixWorld.value.decompose(position, rotation, scale)

  const onRelease = () => {
    const bboxSnapState = getState(ObjectGridSnapState)
    if (bboxSnapState.enabled) {
      ObjectGridSnapState.apply()
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

  const onChangeRotation = (value: Quaternion) => {
    const selectedEntities = SelectionState.getSelectedEntities()
    EditorControlFunctions.rotateObject(selectedEntities, [value])
  }

  const onChangeScale = (value: Vector3) => {
    const selectedEntities = SelectionState.getSelectedEntities()
    EditorControlFunctions.scaleObject(selectedEntities, [value], true)
  }

  return (
    <ComponentDropdown
      name={t('editor:properties.transform.title')}
      description={t('editor:properties.transform.description')}
      Icon={TransformPropertyGroup.iconComponent}
      entity={props.entity}
    >
      <InputGroup
        name="Dynamically Load Children"
        label={t('editor:properties.lbl-dynamicLoad')}
        labelClassName="font-normal text-[#6B6D78]"
        className="flex w-auto flex-row-reverse flex-nowrap items-center gap-1"
        containerClassName="mb-4"
      >
        <Checkbox checked={hasDynamicLoad} onChange={onChangeDynamicLoad} className="mr-2" />
        {hasDynamicLoad && (
          <NumericInput
            min={1}
            max={100}
            value={getComponent(props.entity, SceneDynamicLoadTagComponent).distance}
            onChange={updateProperty(SceneDynamicLoadTagComponent, 'distance')}
            onRelease={commitProperty(SceneDynamicLoadTagComponent, 'distance')}
          />
        )}
      </InputGroup>
      <InputGroup name="Position" label={t('editor:properties.transform.lbl-position')} className="w-auto">
        <Vector3Input
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={position}
          onChange={onChangePosition}
          onRelease={onRelease}
        />
      </InputGroup>
      <InputGroup name="Rotation" label={t('editor:properties.transform.lbl-rotation')} className="w-auto">
        <EulerInput quaternion={rotation} onChange={onChangeRotation} unit="°" onRelease={onRelease} />
      </InputGroup>
      <InputGroup name="Scale" label={t('editor:properties.transform.lbl-scale')} className="w-auto">
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
    </ComponentDropdown>
  )
}

TransformPropertyGroup.iconComponent = LuMove3D

export default TransformPropertyGroup
