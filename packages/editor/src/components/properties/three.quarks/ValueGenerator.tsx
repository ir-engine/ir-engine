import React, { useCallback } from 'react'

import {
  ValueGeneratorJSON,
  ValueGeneratorJSONDefaults
} from '@etherealengine/engine/src/scene/components/ParticleSystemComponent'
import { State } from '@etherealengine/hyperflux/functions/StateFunctions'

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
  const onChangeType = useCallback(() => {
    const thisOnChange = onChange('type')
    return (type: typeof value.type) => {
      scope.set(ValueGeneratorJSONDefaults[type])
      thisOnChange(type)
    }
  }, [])

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
          onChange={onChangeType()}
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
            <PaginatedList list={value.functions} element={(item) => <div></div>} />
          </div>
        )}
      </InputGroup>
    </div>
  )
}
