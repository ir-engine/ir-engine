import React from 'react'

import {
  ConstantValueJSON,
  IntervalValueJSON,
  ValueGeneratorJSON
} from '@xrengine/engine/src/scene/components/ParticleSystemComponent'
import { State } from '@xrengine/hyperflux/functions/StateFunctions'

import InputGroup from '../../inputs/InputGroup'
import NumericInputGroup from '../../inputs/NumericInputGroup'
import SelectInput from '../../inputs/SelectInput'
import PaginatedList from '../../layout/PaginatedList'

export default function ValueGenerator({
  scope,
  value,
  onChange
}: {
  scope: State<ValueGeneratorJSON>
  value: ValueGeneratorJSON
  onChange: (key: string) => (value: any) => void
}) {
  return (
    <div>
      <InputGroup name="type" label="Type">
        <SelectInput
          value={value.type}
          options={[
            { label: 'Constant', value: 'ConstantValue' },
            { label: 'Interval', value: 'IntervalValue' },
            { label: 'Bezier', value: 'PiecewiseBezier' }
          ]}
          onChange={(type: typeof value.type) => {
            const baseVal =
              value.type === 'ConstantValue'
                ? value.value
                : value.type === 'IntervalValue'
                ? (value.a + value.b) / 2
                : 0
            scope.set(
              (type === 'ConstantValue'
                ? { type, value: baseVal }
                : { type, a: baseVal, b: baseVal }) as ValueGeneratorJSON
            )
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
        {value.type === 'PiecewiseBezier' && (
          <div>
            <PaginatedList list={value.functions} element={(item, index) => <div></div>} />
          </div>
        )}
      </InputGroup>
    </div>
  )
}
