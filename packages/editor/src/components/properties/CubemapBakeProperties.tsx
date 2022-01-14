/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */

import React from 'react'
import { CubemapBakeRefreshTypes } from '@xrengine/engine/src/scene/types/CubemapBakeRefreshTypes'
import { CubemapBakeTypes } from '@xrengine/engine/src/scene/types/CubemapBakeTypes'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import Vector3Input from '../inputs/Vector3Input'
import { BakePropertyTypes } from './CubemapBakeNodeEditor'
import {
  CubemapBakeComponent,
  CubemapBakeComponentType
} from '@xrengine/engine/src/scene/components/CubemapBakeComponent'
import { updateProperty } from './Util'

type CubemapBakePropertyEditorProps = {
  bakeComponent: CubemapBakeComponentType
  element: any
}

const cubemapBakeSelectTypes = [
  {
    label: 'Runtime',
    value: CubemapBakeTypes.Realtime
  },
  {
    label: 'Baked',
    value: CubemapBakeTypes.Baked
  }
]

const cubemapBakeRefreshSelectTypes = [
  {
    label: 'On Awake',
    value: CubemapBakeRefreshTypes.OnAwake
  }
  // {
  //     label:"Every Frame",
  //     value:CubemapBakeRefreshTypes.EveryFrame,
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

export const CubemapBakeProperties = (props: CubemapBakePropertyEditorProps) => {
  const getPropertyValue = (option: string) => props.bakeComponent.options[option]

  let renderVal = <></>
  const label = props.element.label
  const propertyName = props.element.propertyName
  const changehandler = updateProperty(CubemapBakeComponent, `options.${propertyName}` as any)

  switch (props.element.type) {
    case BakePropertyTypes.Boolean:
      renderVal = <BooleanInput value={getPropertyValue(propertyName)} onChange={changehandler} />
      break
    case BakePropertyTypes.CubemapBakeType:
      renderVal = (
        <SelectInput options={cubemapBakeSelectTypes} onChange={changehandler} value={getPropertyValue(propertyName)} />
      )
      break

    case BakePropertyTypes.RefreshMode:
      renderVal = (
        <SelectInput
          options={cubemapBakeRefreshSelectTypes}
          onChange={changehandler}
          value={getPropertyValue(propertyName)}
        />
      )
      break

    case BakePropertyTypes.Resolution:
      renderVal = (
        <SelectInput options={bakeResolutionTypes} onChange={changehandler} value={getPropertyValue(propertyName)} />
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
