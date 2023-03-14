import React, { useCallback } from 'react'
import { Color } from 'three'
import { FunctionJSON } from 'three.quarks/dist/three.quarks.esm'

import {
  ColorGeneratorJSON,
  ColorGeneratorJSONDefaults,
  ColorGradientJSON,
  ColorJSON,
  ColorRangeJSON,
  ConstantColorJSON,
  RandomColorJSON
} from '@etherealengine/engine/src/scene/components/ParticleSystemComponent'
import { State } from '@etherealengine/hyperflux/functions/StateFunctions'

import ColorInput from '../../inputs/ColorInput'
import InputGroup from '../../inputs/InputGroup'
import NumericInputGroup from '../../inputs/NumericInputGroup'
import SelectInput from '../../inputs/SelectInput'

export function ColorJSONInput({ value, onChange }: { value: ColorJSON; onChange: (color: ColorJSON) => void }) {
  return (
    <>
      <InputGroup name="color" label="Color">
        <ColorInput
          value={new Color(value.r, value.g, value.b)}
          onChange={(color: Color) => {
            onChange({ r: color.r, g: color.g, b: color.b, a: value.a })
          }}
        />
      </InputGroup>
      <NumericInputGroup
        name="opacity"
        label="Opacity"
        value={value.a}
        onChange={(alpha) => onChange({ r: value.r, g: value.g, b: value.b, a: alpha })}
      />
    </>
  )
}

export default function ColorGenerator({
  scope,
  value,
  onChange
}: {
  scope: State<ColorGeneratorJSON> | State<ColorGeneratorJSON & FunctionJSON>
  value: ColorGeneratorJSON
  onChange: (
    key: keyof (ConstantColorJSON & ColorRangeJSON & RandomColorJSON & ColorGradientJSON)
  ) => (value: any) => void
}) {
  const onChangeType = useCallback(() => {
    const thisOnChange = onChange('type')
    return (type: typeof value.type) => {
      scope.set(ColorGeneratorJSONDefaults[type])
      thisOnChange(type)
    }
  }, [])

  return (
    <div>
      <InputGroup name="type" label="Type">
        <SelectInput
          value={value.type}
          options={[
            { label: 'Constant', value: 'ConstantColor' },
            { label: 'Range', value: 'ColorRange' },
            { label: 'Random', value: 'RandomColor' },
            { label: 'Gradient', value: 'Gradient' }
          ]}
          onChange={onChangeType()}
        />
      </InputGroup>
      {value.type === 'ConstantColor' && <ColorJSONInput value={value.color} onChange={onChange('color')} />}
      {value.type === 'ColorRange' && (
        <>
          <InputGroup name="A" label="A">
            <ColorJSONInput value={value.a} onChange={onChange('a')} />
          </InputGroup>
          <InputGroup name="B" label="B">
            <ColorJSONInput value={value.b} onChange={onChange('b')} />
          </InputGroup>
        </>
      )}
      {value.type === 'RandomColor' && (
        <>
          <InputGroup name="A" label="A">
            <ColorJSONInput value={value.a} onChange={onChange('a')} />
          </InputGroup>
          <InputGroup name="B" label="B">
            <ColorJSONInput value={value.b} onChange={onChange('b')} />
          </InputGroup>
        </>
      )}
    </div>
  )
}
