import React, { useCallback } from 'react'

import {
  BezierFunctionJSON,
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
  onChange: (key: string) => (value: any) => void
}) {
  const onChangeType = useCallback(() => {
    const thisOnChange = onChange('type')
    return (type: typeof value.type) => {
      scope.set(ValueGeneratorJSONDefaults[type])
      thisOnChange(type)
    }
  }, [])

  const onAddBezier = useCallback(() => {
    const thisOnChange = onChange('functions')
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

  const onEditBezierCurve = useCallback((element: State<BezierFunctionJSON>, key: string) => {
    return (value: any) => {
      element.function[key].set(value)
    }
  }, [])

  const onEditBezierStart = useCallback((element: State<BezierFunctionJSON>) => {
    return (value: any) => {
      element.start.set(value)
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
            <Button onClick={onAddBezier()}>Add Bezier</Button>
            <PaginatedList
              list={(scope as State<PiecewiseBezierValueJSON>).functions}
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
                    onChange={onEditBezierCurve(element, 'p0')}
                  />
                  <NumericInputGroup
                    name="p1"
                    label="p1"
                    value={element.function.p1.value}
                    onChange={onEditBezierCurve(element, 'p1')}
                  />
                  <NumericInputGroup
                    name="p2"
                    label="p2"
                    value={element.function.p2.value}
                    onChange={onEditBezierCurve(element, 'p2')}
                  />
                  <NumericInputGroup
                    name="p3"
                    label="p3"
                    value={element.function.p3.value}
                    onChange={onEditBezierCurve(element, 'p3')}
                  />
                  <br />
                  <hr />
                  <br />
                  <NumericInputGroup
                    name="start"
                    label={'Start'}
                    value={element.start.value}
                    onChange={onEditBezierStart(element)}
                  />
                </div>
              )}
            />
          </div>
        )}
      </InputGroup>
    </div>
  )
}
