import React from 'react'

import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { EnvMapBakeComponent, EnvMapBakeComponentType } from '@xrengine/engine/src/scene/components/EnvMapBakeComponent'
import { EnvMapBakeRefreshTypes } from '@xrengine/engine/src/scene/types/EnvMapBakeRefreshTypes'
import { EnvMapBakeTypes } from '@xrengine/engine/src/scene/types/EnvMapBakeTypes'

import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import Vector3Input from '../inputs/Vector3Input'
import { BakePropertyTypes } from './EnvMapBakeNodeEditor'
import { updateProperty } from './Util'

type EnvMapBakePropertyEditorProps = {
  bakeComponent: EnvMapBakeComponentType
  element: any
  node: EntityTreeNode
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
  const getPropertyValue = (option: string) => props.bakeComponent[option]

  let renderVal = <></>
  const label = props.element.label
  const propertyName = props.element.propertyName
  const changehandler = updateProperty(EnvMapBakeComponent, propertyName)

  switch (props.element.type) {
    case BakePropertyTypes.Boolean:
      renderVal = <BooleanInput value={getPropertyValue(propertyName)} onChange={changehandler} />
      break
    case BakePropertyTypes.BakeType:
      renderVal = (
        <SelectInput
          key={props.node.entity}
          options={envMapBakeSelectTypes}
          onChange={changehandler}
          value={getPropertyValue(propertyName)}
        />
      )
      break

    case BakePropertyTypes.RefreshMode:
      renderVal = (
        <SelectInput
          key={props.node.entity}
          options={envMapBakeRefreshSelectTypes}
          onChange={changehandler}
          value={getPropertyValue(propertyName)}
        />
      )
      break

    case BakePropertyTypes.Resolution:
      renderVal = (
        <SelectInput
          key={props.node.entity}
          options={bakeResolutionTypes}
          onChange={changehandler}
          value={getPropertyValue(propertyName)}
        />
      )
      break

    case BakePropertyTypes.Vector:
      renderVal = <Vector3Input onChange={changehandler} value={getPropertyValue(propertyName)} />
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
