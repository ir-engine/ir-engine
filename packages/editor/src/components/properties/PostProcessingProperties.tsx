import { AnyMxRecord } from 'dns'
import React from 'react'
import BooleanInput from '../inputs/BooleanInput'
import ColorInput from '../inputs/ColorInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import { PostProcessingPropertyTypes } from './PostProcessingNodeEditor'

const BlendFunctionSelect = [
  {
    label: 'Skip',
    value: 0
  },
  {
    label: 'Add',
    value: 1
  },
  {
    label: 'ALPHA',
    value: 2
  },
  {
    label: 'AVERAGE',
    value: 3
  },
  {
    label: 'COLOR_BURN',
    value: 4
  },
  {
    label: 'COLOR_DODGE',
    value: 5
  },
  {
    label: 'DARKEN',
    value: 6
  },
  {
    label: 'DIFFERENCE',
    value: 7
  },
  {
    label: 'EXCLUSION',
    value: 8
  },
  {
    label: 'LIGHTEN',
    value: 9
  },
  {
    label: 'MULTIPLY',
    value: 10
  },
  {
    label: 'DIVIDE',
    value: 11
  },
  {
    label: 'NEGATION',
    value: 12
  },
  {
    label: 'NORMAL',
    value: 13
  },
  {
    label: 'OVERLAY',
    value: 14
  },
  {
    label: 'REFLECT',
    value: 15
  },
  {
    label: 'SCREEN',
    value: 16
  },
  {
    label: 'SOFT_LIGHT',
    value: 17
  },
  {
    label: 'SUBTRACT',
    value: 18
  }
]

const KernelSizeSelect = [
  {
    label: 'VERY_SMALL',
    value: 0
  },
  {
    label: 'SMALL',
    value: 1
  },

  {
    label: 'MEDIUM',
    value: 2
  },
  {
    label: 'LARGE',
    value: 3
  },
  {
    label: 'VERY_LARGE',
    value: 4
  },
  {
    label: 'HUGE',
    value: 5
  }
]
interface Props {
  effectKey?: string
  propKey?: string
  params?: any
  value?: any
  onChangeFunction?: any
}

/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */
export const PostProcessingProperties = (props: Props) => {
  const onPropertyValueChanged = (event) => {
    props.onChangeFunction(event, props.effectKey, props.propKey)
  }

  let renderVal = <></>
  switch (props.params.propertyType) {
    case PostProcessingPropertyTypes.Number:
      renderVal = (
        <CompoundNumericInput
          min={props.params.min}
          max={props.params.max}
          step={props.params.step}
          value={props.value}
          onChange={onPropertyValueChanged}
        />
      )
      break

    case PostProcessingPropertyTypes.Boolean:
      renderVal = <BooleanInput onChange={onPropertyValueChanged} value={props.value} />
      break

    case PostProcessingPropertyTypes.BlendFunction:
      renderVal = <SelectInput options={BlendFunctionSelect} onChange={onPropertyValueChanged} value={props.value} />
      break

    case PostProcessingPropertyTypes.Color:
      renderVal = <ColorInput value={props.value} onChange={onPropertyValueChanged} isValueAsInteger={true} />
      break

    case PostProcessingPropertyTypes.KernelSize:
      renderVal = <SelectInput options={KernelSizeSelect} onChange={onPropertyValueChanged} value={props.value} />
      break

    default:
      renderVal = <>Can't Determine type of property</>
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <InputGroup name={props.params.name} label={props.params.name}>
        {renderVal}
      </InputGroup>
    </div>
  )
}
