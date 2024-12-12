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

import { ComponentType } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { EnvMapBakeComponent } from '@ir-engine/engine/src/scene/components/EnvMapBakeComponent'
import { EnvMapBakeRefreshTypes } from '@ir-engine/engine/src/scene/types/EnvMapBakeRefreshTypes'
import { EnvMapBakeTypes } from '@ir-engine/engine/src/scene/types/EnvMapBakeTypes'

import { commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { Checkbox } from '@ir-engine/ui'
import { BakePropertyTypes } from '..'
import InputGroup from '../../../input/Group'
import SelectInput from '../../../input/Select'
import Vector3Input from '../../../input/Vector3'

type EnvMapBakePropertyEditorProps = {
  bakeComponent: ComponentType<typeof EnvMapBakeComponent>
  element: any
  entity: Entity
}

const envMapBakeSelectTypes = [
  {
    label: 'Runtime',
    value: EnvMapBakeTypes.Realtime
  },
  {
    label: 'Baked',
    value: EnvMapBakeTypes.Baked
  }
]

const envMapBakeRefreshSelectTypes = [
  {
    label: 'On Awake',
    value: EnvMapBakeRefreshTypes.OnAwake
  }
  // {
  //     label:"Every Frame",
  //     value: EnvMapBakeRefreshTypes.EveryFrame,
  // }
]

const bakeResolutionTypes = [
  {
    label: '128',
    value: 128
  },
  {
    label: '256',
    value: 256
  },
  {
    label: '512',
    value: 512
  },
  {
    label: '1024',
    value: 1024
  },
  {
    label: '2048',
    value: 2048
  }
]

export const EnvMapBakeProperties = (props: EnvMapBakePropertyEditorProps) => {
  const getPropertyValue = (option) => props.bakeComponent[option]

  let renderVal = <></>
  const label = props.element.label
  const propertyName = props.element.propertyName

  switch (props.element.type) {
    case BakePropertyTypes.Boolean:
      renderVal = (
        <Checkbox
          checked={getPropertyValue(propertyName)}
          onChange={commitProperty(EnvMapBakeComponent, propertyName)}
        />
      )
      break
    case BakePropertyTypes.BakeType:
      renderVal = (
        <SelectInput
          key={props.entity}
          options={envMapBakeSelectTypes}
          onChange={commitProperty(EnvMapBakeComponent, propertyName)}
          value={getPropertyValue(propertyName)}
        />
      )
      break

    case BakePropertyTypes.RefreshMode:
      renderVal = (
        <SelectInput
          key={props.entity}
          options={envMapBakeRefreshSelectTypes}
          onChange={commitProperty(EnvMapBakeComponent, propertyName)}
          value={getPropertyValue(propertyName)}
        />
      )
      break

    case BakePropertyTypes.Resolution:
      renderVal = (
        <SelectInput
          key={props.entity}
          options={bakeResolutionTypes}
          onChange={commitProperty(EnvMapBakeComponent, propertyName)}
          value={getPropertyValue(propertyName)}
        />
      )
      break

    case BakePropertyTypes.Vector:
      renderVal = (
        <Vector3Input
          onChange={updateProperty(EnvMapBakeComponent, propertyName)}
          onRelease={commitProperty(EnvMapBakeComponent, propertyName)}
          value={getPropertyValue(propertyName)}
        />
      )
      break

    default:
      renderVal = <div>Undefined value Type</div>
      break
  }

  return (
    <InputGroup name={label} label={label}>
      {renderVal}
    </InputGroup>
  )
}

export default EnvMapBakeProperties
