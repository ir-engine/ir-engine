import React from 'react'
import { Color } from 'three'

import {
  ConstantColorJSON,
  ConstantValueJSON,
  IntervalValueJSON
} from '@xrengine/engine/src/scene/components/ParticleSystemComponent'
import { State } from '@xrengine/hyperflux/functions/StateFunctions'

import ColorInput from '../../inputs/ColorInput'
import InputGroup from '../../inputs/InputGroup'
import NumericInputGroup from '../../inputs/NumericInputGroup'
import SelectInput from '../../inputs/SelectInput'

export default function ColorGenerator({
  scope,
  value,
  onChange
}: {
  scope: State<ConstantColorJSON>
  value: ConstantColorJSON
  onChange: (key: keyof ConstantColorJSON) => (value: any) => void
}) {
  return (
    <div>
      <InputGroup name="type" label="Type">
        <SelectInput value={value.type} options={[{ label: 'Constant', value: 'ConstantColor' }]} />
        <hr />
        {value.type === 'ConstantColor' && (
          <div>
            <ColorInput
              value={new Color(value.color.r, value.color.g, value.color.b)}
              onChange={(color: Color) => {
                scope.color.r.set(color.r)
                scope.color.g.set(color.g)
                scope.color.b.set(color.b)
              }}
            />
            <NumericInputGroup
              name="opacity"
              label="Opacity"
              value={value.color.a}
              onChange={(alpha) => scope.color.a.set(alpha)}
            />
          </div>
        )}
      </InputGroup>
    </div>
  )
}
