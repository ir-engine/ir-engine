import React, { useCallback } from 'react'
import { Color } from 'three'

import {
  ColorGeneratorJSON,
  ColorGradientJSON,
  ColorJSON,
  ColorRangeJSON,
  ConstantColorJSON,
  ConstantValueJSON,
  IntervalValueJSON,
  RandomColorJSON
} from '@xrengine/engine/src/scene/components/ParticleSystemComponent'
import { State } from '@xrengine/hyperflux/functions/StateFunctions'

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
  value,
  onChange
}: {
  value: ColorGeneratorJSON
  onChange: (
    key: keyof (ConstantColorJSON & ColorRangeJSON & RandomColorJSON & ColorGradientJSON)
  ) => (value: any) => void
}) {
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
        />
        <hr />
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
      </InputGroup>
    </div>
  )
}
