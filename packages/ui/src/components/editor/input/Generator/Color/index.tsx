/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useCallback } from 'react'
import { Color } from 'three'

import { State } from '@ir-engine/hyperflux'

import {
  ColorGeneratorJSON,
  ColorGeneratorJSONDefaults,
  ColorGradientJSON,
  ColorJSON,
  ColorRangeJSON,
  ConstantColorJSON,
  RandomColorJSON
} from '@ir-engine/engine/src/scene/types/ParticleSystemTypes'
import Button from '../../../../../primitives/tailwind/Button'
import ColorInput from '../../../../../primitives/tailwind/Color'
import Text from '../../../../../primitives/tailwind/Text'
import InputGroup from '../../Group'
import NumericInput from '../../Numeric'
import SelectInput from '../../Select'

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
      <InputGroup name="opacity" label="Opacity">
        <NumericInput
          value={value.a}
          onChange={(alpha) => onChange({ r: value.r, g: value.g, b: value.b, a: alpha })}
        />
      </InputGroup>
    </>
  )
}

export default function ColorGenerator({
  path,
  scope,
  value,
  onChange
}: {
  path: string
  scope: State<ColorGeneratorJSON>
  value: ColorGeneratorJSON
  onChange: (path: string) => (value: any) => void
}) {
  const onChangeType = useCallback(() => {
    const thisOnChange = onChange(path + '.type')
    return (type: typeof value.type) => {
      scope.set(ColorGeneratorJSONDefaults[type])
      thisOnChange(type)
    }
  }, [])

  const ConstantColorInput = useCallback(() => {
    const constantScope = scope as State<ConstantColorJSON>
    const constant = constantScope.value
    return <ColorJSONInput value={constant.color} onChange={onChange(path + '.color')} />
  }, [scope])

  const ColorRangeInput = useCallback(() => {
    const rangeScope = scope as State<ColorRangeJSON>
    const range = rangeScope.value
    return (
      <>
        <InputGroup name="A" label="A">
          <ColorJSONInput value={range.a} onChange={onChange(path + '.a')} />
        </InputGroup>
        <InputGroup name="B" label="B">
          <ColorJSONInput value={range.b} onChange={onChange(path + '.b')} />
        </InputGroup>
      </>
    )
  }, [scope])

  const RandomColorInput = useCallback(() => {
    const randomScope = scope as State<RandomColorJSON>
    const random = randomScope.value
    return (
      <>
        <InputGroup name="A" label="A">
          <ColorJSONInput value={random.a} onChange={onChange(path + '.a')} />
        </InputGroup>
        <InputGroup name="B" label="B">
          <ColorJSONInput value={random.b} onChange={onChange(path + '.b')} />
        </InputGroup>
      </>
    )
  }, [scope])

  const onRemoveGradient = (index: number) => {
    const gradientScope = scope as State<ColorGradientJSON>
    const gradient = gradientScope.value
    const thisOnChange = onChange(path + '.functions')
    const nuFunctions = [...gradient.functions]
    nuFunctions.splice(index, 1)
    thisOnChange(JSON.parse(JSON.stringify(nuFunctions)))
  }

  const GradientInput = useCallback(() => {
    const gradientScope = scope as State<ColorGradientJSON>
    const gradient = gradientScope.value
    return (
      <div>
        <Button
          onClick={() => {
            const gradientState = scope as State<ColorGradientJSON>
            gradientState.functions.set([
              ...JSON.parse(JSON.stringify(gradient.functions)),
              {
                start: 0,
                function: {
                  type: 'ColorRange',
                  a: { r: 1, g: 1, b: 1, a: 1 },
                  b: { r: 1, g: 1, b: 1, a: 1 }
                }
              }
            ])
          }}
        >
          +
        </Button>

        {gradient.functions.map((item, index) => (
          <div
            key={index}
            style={{
              border: '1px solid white',
              borderRadius: '0.5rem',
              margin: '1rem',
              padding: '1.5rem',
              overflow: 'auto'
            }}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-x-1">
                <Text fontSize="xs">Start</Text>
                <NumericInput value={item.start} onChange={onChange(path + '.functions.' + index + '.start')} />
              </div>

              <div className="flex items-center gap-x-1">
                <Text fontSize="xs">A</Text>
                <div className="col-span-1 grid">
                  <ColorJSONInput
                    value={item.function.a}
                    onChange={onChange(path + '.functions.' + index + '.function.a')}
                  />
                </div>
              </div>

              <div className="flex items-center gap-x-1">
                <Text fontSize="xs">B</Text>
                <div className="col-span-1 grid">
                  <ColorJSONInput
                    value={item.function.b}
                    onChange={onChange(path + '.functions.' + index + '.function.b')}
                  />
                </div>
              </div>
            </div>
            <Button onClick={() => onRemoveGradient(index)}>Remove</Button>
          </div>
        ))}
      </div>
    )
  }, [scope])

  const colorInputs = {
    ConstantColor: ConstantColorInput,
    ColorRange: ColorRangeInput,
    RandomColor: RandomColorInput,
    Gradient: GradientInput
  }

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
      {colorInputs[value.type]()}
    </div>
  )
}
