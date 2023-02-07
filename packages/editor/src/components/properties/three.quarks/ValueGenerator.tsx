import React from 'react'

import { ConstantValueJSON, IntervalValueJSON } from '@xrengine/engine/src/scene/components/ParticleSystemComponent'
import { State } from '@xrengine/hyperflux/functions/StateFunctions'

import InputGroup from '../../inputs/InputGroup'
import NumericInputGroup from '../../inputs/NumericInputGroup'
import SelectInput from '../../inputs/SelectInput'

export default function ValueGenerator({
  scope,
  value,
  onChange
}: {
  scope: State<ConstantValueJSON | IntervalValueJSON>
  value: ConstantValueJSON | IntervalValueJSON
  onChange: (key: keyof (ConstantValueJSON & IntervalValueJSON)) => (value: any) => void
}) {
  return (
    <div>
      <InputGroup name="type" label="Type">
        <SelectInput
          value={value.type}
          options={[
            { label: 'Constant', value: 'ConstantValue' },
            { label: 'Interval', value: 'IntervalValue' }
          ]}
          onChange={(type: typeof scope.type.value) => {
            const baseVal = value.type === 'ConstantValue' ? value.value : value.a
            scope.set(type === 'ConstantValue' ? { type, value: baseVal } : { type, a: baseVal, b: baseVal })
          }}
        />
        <hr />
        {value.type === 'ConstantValue' && (
          <div>
            <NumericInputGroup name="value" label="Value" value={value.value} onChange={onChange('value')} />
          </div>
        )}
        {value.type === 'IntervalValue' && (
          <div>
            <NumericInputGroup name="min" label="Min" value={value.a} onChange={onChange('a')} />
            <NumericInputGroup name="max" label="Max" value={value.b} onChange={onChange('b')} />
          </div>
        )}
      </InputGroup>
    </div>
  )
}
