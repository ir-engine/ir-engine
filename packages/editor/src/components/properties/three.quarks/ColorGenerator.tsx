/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Grid } from '@mui/material'
import React, { useCallback } from 'react'
import { Color } from 'three'

import {
  ColorGeneratorJSON,
  ColorGeneratorJSONDefaults,
  ColorGradientFunctionJSON,
  ColorGradientJSON,
  ColorJSON,
  ColorRangeJSON,
  ConstantColorJSON,
  RandomColorJSON
} from '@etherealengine/engine/src/scene/components/ParticleSystemComponent'
import { State } from '@etherealengine/hyperflux/functions/StateFunctions'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { Button } from '../../inputs/Button'
import ColorInput from '../../inputs/ColorInput'
import InputGroup from '../../inputs/InputGroup'
import NumericInput from '../../inputs/NumericInput'
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
  scope: State<ColorGeneratorJSON>
  value: ColorGeneratorJSON
  onChange: (scope: State<any>) => (value: any) => void
}) {
  const onChangeType = useCallback(() => {
    const thisOnChange = onChange(scope.type)
    return (type: typeof value.type) => {
      scope.set(ColorGeneratorJSONDefaults[type])
      thisOnChange(type)
    }
  }, [])

  const ConstantColorInput = useCallback(() => {
    const constantScope = scope as State<ConstantColorJSON>
    const constant = constantScope.value
    return <ColorJSONInput value={constant.color} onChange={onChange(constantScope.color)} />
  }, [scope])

  const ColorRangeInput = useCallback(() => {
    const rangeScope = scope as State<ColorRangeJSON>
    const range = rangeScope.value
    return (
      <>
        <InputGroup name="A" label="A">
          <ColorJSONInput value={range.a} onChange={onChange(rangeScope.a)} />
        </InputGroup>
        <InputGroup name="B" label="B">
          <ColorJSONInput value={range.b} onChange={onChange(rangeScope.b)} />
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
          <ColorJSONInput value={random.a} onChange={onChange(randomScope.a)} />
        </InputGroup>
        <InputGroup name="B" label="B">
          <ColorJSONInput value={random.b} onChange={onChange(randomScope.b)} />
        </InputGroup>
      </>
    )
  }, [scope])

  const onRemoveGradient = useCallback((element: State<ColorGradientFunctionJSON>) => {
    const gradientScope = scope as State<ColorGradientJSON>
    const gradient = gradientScope.value
    const thisOnChange = onChange(gradientScope.functions)
    return () => {
      const nuFunctions = gradient.functions.filter((item) => item !== element.value)
      thisOnChange(JSON.parse(JSON.stringify(nuFunctions)))
    }
  }, [])

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
            <Grid
              container
              spacing={1}
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Grid item xs={2}>
                <Typography>Start</Typography>
              </Grid>
              <Grid item xs={10}>
                <NumericInput value={item.start} onChange={onChange(gradientScope.functions[index].start)} />
              </Grid>
              <Grid item xs={2}>
                <Typography>A</Typography>
              </Grid>
              <Grid item xs={10}>
                <ColorJSONInput
                  value={item.function.a}
                  onChange={onChange(gradientScope.functions[index].function.a)}
                />
              </Grid>
              <Grid item xs={2}>
                <Typography>B</Typography>
              </Grid>
              <Grid item xs={10}>
                <ColorJSONInput
                  value={item.function.b}
                  onChange={onChange(gradientScope.functions[index].function.b)}
                />
              </Grid>
            </Grid>
            <Button onClick={onRemoveGradient(gradientScope.functions[index])}>Remove</Button>
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
