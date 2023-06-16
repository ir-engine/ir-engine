import React, { useCallback } from 'react'

import {
  BezierFunctionJSON,
  ConstantValueJSON,
  IntervalValueJSON,
  PiecewiseBezierValueJSON,
  ValueGeneratorJSON,
  ValueGeneratorJSONDefaults
} from '@etherealengine/engine/src/scene/components/ParticleSystemComponent'
import { State } from '@etherealengine/hyperflux/functions/StateFunctions'

import { Button } from '../../inputs/Button'
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
  onChange: (scope: State<any>) => (value: any) => void
}) {
  const onChangeType = useCallback(() => {
    const thisOnChange = onChange(scope.type)
    return (type: typeof value.type) => {
      scope.set(JSON.parse(JSON.stringify(ValueGeneratorJSONDefaults[type])))
      thisOnChange(type)
    }
  }, [])

  const onAddBezier = useCallback(() => {
    const bezierScope = scope as State<PiecewiseBezierValueJSON>
    const thisOnChange = onChange(bezierScope.functions)
    return () => {
      const bezierJson = value as PiecewiseBezierValueJSON
      const nuFunctions = [
        ...JSON.parse(JSON.stringify(bezierJson.functions)),
        {
          function: {
            p0: 0,
            p1: 0,
            p2: 1,
            p3: 1
          },
          start: 0
        } as BezierFunctionJSON
      ]
      thisOnChange(nuFunctions)
    }
  }, [])

  const onRemoveBezier = useCallback((element: State<BezierFunctionJSON>) => {
    const bezierScope = scope as State<PiecewiseBezierValueJSON>
    const bezier = bezierScope.value
    const thisOnChange = onChange(bezierScope.functions)
    return () => {
      const nuFunctions = bezier.functions.filter((f) => f !== element.value)
      thisOnChange(JSON.parse(JSON.stringify(nuFunctions)))
    }
  }, [])

  const ConstantInput = useCallback(() => {
    const constantScope = scope as State<ConstantValueJSON>
    const constant = constantScope.value
    return (
      <>
        <NumericInputGroup
          name="value"
          label="Value"
          value={constant.value}
          onChange={onChange(constantScope.nested('value'))}
        />
      </>
    )
  }, [scope])

  const IntervalInput = useCallback(() => {
    const intervalScope = scope as State<IntervalValueJSON>
    const interval = intervalScope.value
    return (
      <>
        <NumericInputGroup name="min" label="Min" value={interval.a} onChange={onChange(intervalScope.a)} />
        <NumericInputGroup name="max" label="Max" value={interval.b} onChange={onChange(intervalScope.b)} />
      </>
    )
  }, [scope])

  const BezierInput = useCallback(() => {
    const bezierScope = scope as State<PiecewiseBezierValueJSON>
    return (
      <div>
        <Button onClick={onAddBezier()}>Add Bezier</Button>
        <PaginatedList
          list={bezierScope.functions}
          element={(element: State<BezierFunctionJSON>) => (
            <div
              style={{
                margin: '2rem',
                padding: '2rem',
                border: '1px solid white',
                borderRadius: '1rem'
              }}
            >
              <NumericInputGroup
                name="p0"
                label="p0"
                value={element.function.p0.value}
                onChange={onChange(element.function.p0)}
              />
              <NumericInputGroup
                name="p1"
                label="p1"
                value={element.function.p1.value}
                onChange={onChange(element.function.p1)}
              />
              <NumericInputGroup
                name="p2"
                label="p2"
                value={element.function.p2.value}
                onChange={onChange(element.function.p2)}
              />
              <NumericInputGroup
                name="p3"
                label="p3"
                value={element.function.p3.value}
                onChange={onChange(element.function.p3)}
              />
              <br />
              <hr />
              <br />
              <NumericInputGroup
                name="start"
                label={'Start'}
                value={element.start.value}
                onChange={onChange(element.start)}
              />
              <br />
              <Button onClick={onRemoveBezier(element)}>Remove</Button>
            </div>
          )}
        />
      </div>
    )
  }, [scope])

  const valueInputs = {
    ConstantValue: ConstantInput,
    IntervalValue: IntervalInput,
    PiecewiseBezier: BezierInput
  }

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
      </InputGroup>
      {valueInputs[value.type]()}
    </div>
  )
}
